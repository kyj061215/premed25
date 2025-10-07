const stringSimilarity = require('string-similarity');
const fs = require('fs');
const path = require('path');

exports.handler = async (event) => {
  try {
    // 1. 프론트엔드에서 보낸 데이터 가져오기
    const { text: allText, checklist } = JSON.parse(event.body);
    if (!allText) {
      return { statusCode: 400, body: '분석할 텍스트가 없습니다.' };
    }

    // 2. 수료 기준 데이터 파일 읽어오기
    const requirementsPath = path.join(__dirname, '..', '..', 'requirements.json');
    const requirementsData = JSON.parse(fs.readFileSync(requirementsPath, 'utf8'));
    const ocrWords = [...new Set(allText.match(/[a-zA-Z0-9가-힣]{2,}/g) || [])];
    
    // 3. 분석 로직 시작
    const analysisResult = {};
    const allRequiredCourseNames = new Set();

    for (const category in requirementsData) {
        const categoryData = requirementsData[category];
        const completed = [];
        let remaining = [];
        let completedCount = 0;
        let requiredCount = 0;
        let displayType = 'default';

        switch (category) {
            case "전공 필수":
                displayType = 'list_all';
                categoryData.courses.forEach(course => {
                    const courseName = typeof course === 'object' ? course.name : course;
                    allRequiredCourseNames.add(courseName);
                    const matches = stringSimilarity.findBestMatch(courseName, ocrWords);
                    if (matches.bestMatch.rating > 0.4) {
                        completed.push(courseName);
                    } else {
                        remaining.push(courseName);
                    }
                });
                break;

            case "전공 선택":
                displayType = 'count';
                requiredCount = 4;
                categoryData.courses.forEach(course => {
                    const courseName = typeof course === 'object' ? course.name : course;
                    allRequiredCourseNames.add(courseName);
                    const matches = stringSimilarity.findBestMatch(courseName, ocrWords);
                    if (matches.bestMatch.rating > 0.4) {
                        completed.push(courseName);
                    }
                });
                completedCount = completed.length;
                break;

            case "필수 교양":
                displayType = 'list_remaining_custom';
                const foreignLanguages = ["한국어", "중국어", "한문", "프랑스어", "독일어", "러시아어", "스페인어", "포르투갈어", "몽골어", "스와힐리어", "이태리어", "히브리어", "라틴어", "그리스어", "말레이-인도네시아어", "산스크리트어", "베트남어", "아랍어", "힌디어", "일본어"];
                const nonLanguageCourses = categoryData.courses.filter(c => {
                    const courseName = typeof c === 'object' ? c.name : c;
                    return !foreignLanguages.includes(courseName);
                });
                
                const isForeignLanguageCompleted = foreignLanguages.some(lang => stringSimilarity.findBestMatch(lang, ocrWords).bestMatch.rating > 0.6);
                if (!isForeignLanguageCompleted) {
                    remaining.push("외국어 (택1)");
                }
                foreignLanguages.forEach(c => allRequiredCourseNames.add(c));

                nonLanguageCourses.forEach(course => {
                    const courseName = typeof course === 'object' ? course.name : course;
                    allRequiredCourseNames.add(courseName);
                    const matches = stringSimilarity.findBestMatch(courseName, ocrWords);
                    if (matches.bestMatch.rating < 0.5) {
                        remaining.push(courseName);
                    }
                });
                break;

            case "학문의 세계":
                displayType = 'group_count';
                requiredCount = 3;
                const completedGroups = new Set();
                const allGroups = new Set(categoryData.courses.map(course => course.group));
                
                ocrWords.forEach(word => {
                    const matches = stringSimilarity.findBestMatch(word, categoryData.courses.map(c => c.name));
                    if (matches.bestMatch.rating > 0.4) {
                        const matchedCourseName = matches.bestMatch.target;
                        const originalCourse = categoryData.courses.find(c => c.name === matchedCourseName);
                        if (originalCourse) {
                            completedGroups.add(originalCourse.group);
                            if (!completed.some(c => c.name === originalCourse.name)) {
                                completed.push({ name: originalCourse.name, group: originalCourse.group });
                            }
                        }
                    }
                });
                remaining = Array.from(allGroups).filter(group => !completedGroups.has(group));
                completedCount = completedGroups.size;
                categoryData.courses.forEach(course => allRequiredCourseNames.add(course.name));
                break;

            case "예체능":
                displayType = 'count';
                requiredCount = 3;
                categoryData.courses.forEach(course => {
                    const courseName = typeof course === 'object' ? course.name : course;
                    allRequiredCourseNames.add(courseName);
                    const matches = stringSimilarity.findBestMatch(courseName, ocrWords);
                    if (matches.bestMatch.rating > 0.4) {
                        if (!completed.includes(courseName)) {
                            completed.push(courseName);
                        }
                    }
                });
                completedCount = completed.length;
                break;
        }

        analysisResult[category] = {
            description: categoryData.description,
            completed,
            remaining,
            completedCount,
            requiredCount,
            displayType,
        };
    }

    // 4. 기타 수료 요건 및 이수 과목 처리
    analysisResult["기타 수료 요건"] = {
        description: "시간표 외 수료 요건 달성 현황입니다.",
        data: checklist,
        displayType: 'checklist'
    };

    const courseCandidates = allText.match(/[a-zA-Z0-9가-힣]{2,}/g) || [];
    const uniqueCourses = [...new Set(courseCandidates)];
    const otherCompletedCourses = uniqueCourses.filter(course => !allRequiredCourseNames.has(course));
    analysisResult["기타 이수 과목"] = {
        description: "수료 기준에 포함되지 않은 이수 과목 목록입니다.",
        completed: otherCompletedCourses,
        displayType: 'list_completed_only'
    };

    // 5. 최종 분석 결과 전송
    return {
        statusCode: 200,
        body: JSON.stringify(analysisResult),
    };

  } catch (error) {
    console.error('백엔드 오류:', error);
    return { statusCode: 500, body: JSON.stringify({ message: '분석 중 서버 오류가 발생했습니다.' }) };
  }
};
