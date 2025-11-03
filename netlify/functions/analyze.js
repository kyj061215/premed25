// 이 파일의 위치: netlify/functions/analyze.js

// 0. '학문의 세계' 과목 데이터 (사용자가 제공한 JSON)
// 함수 밖에 정의하여 메모리에 한 번만 로드되도록 합니다.
const allAcademiaCourses = [
    { "name": "21세기 한국소설의 이해", "group": "언어와 문학" }, { "name": "고대그리스.로마문학의 세계", "group": "언어와 문학" }, { "name": "그리스.로마 신화", "group": "언어와 문학" },
    { "name": "도스토예프스키와 톨스토이", "group": "언어와 문학" }, { "name": "동서양 명작 읽기", "group": "언어와 문학" }, { "name": "라틴아메리카 문학과 사회", "group": "언어와 문학" },
    { "name": "문학과 정신분석", "group": "언어와 문학" }, { "name": "문학과 공연예술", "group": "언어와 문학" }, { "name": "문학과 철학의 대화", "group": "언어와 문학" },
    { "name": "문학 속 인간과 기계", "group": "언어와 문학" }, { "name": "문학과 사회", "group": "언어와 문학" }, { "name": "문학과 영상", "group": "언어와 문학" },
    { "name": "서양근대문학의 이해", "group": "언어와 문학" }, { "name": "세계문학과 영문학", "group": "언어와 문학" }, { "name": "스페인어권명작의 이해", "group": "언어와 문학" },
    { "name": "언어의 이해", "group": "언어와 문학" }, { "name": "언어의 세계", "group": "언어와 문학" }, { "name": "여성과 문학", "group": "언어와 문학" },
    { "name": "영미 대중소설의 이해", "group": "언어와 문학" }, { "name": "이중언어사용", "group": "언어와 문학" }, { "name": "중국인의 언어와 문화", "group": "언어와 문학" },
    { "name": "프랑스명작의 이해", "group": "언어와 문학" }, { "name": "한국 문학의 깊이와 상상력", "group": "언어와 문학" }, { "name": "한국문학과 세계문학", "group": "언어와 문학" }, { "name": "한국문학과 여행", "group": "언어와 문학" },
    { "name": "한국어 어휘와 표현", "group": "언어와 문학" }, { "name": "한국인의 언어와 문화", "group": "언어와 문학" }, { "name": "한국의 한자와 한자어", "group": "언어와 문학" },
    { "name": "한국현대시 읽기", "group": "언어와 문학" }, { "name": "한글맞춤법의 이론과 실제", "group": "언어와 문학" }, { "name": "동양의 고전", "group": "언어와 문학" },
    { "name": "언어와 인간", "group": "언어와 문학"},
    { "name": "공연예술의 이해", "group": "문화와 예술" }, { "name": "대중예술의 이해", "group": "문화와 예술" }, { "name": "독일어권 문화의 이해", "group": "문화와 예술" },
    { "name": "동양예술론입문", "group": "문화와 예술" }, { "name": "드라마의 이해와 감상", "group": "문화와 예술" }, { "name": "디자인과 생활", "group": "문화와 예술" },
    { "name": "미국문화와 현대사회의 이해", "group": "문화와 예술" }, { "name": "미술명작의 이해", "group": "문화와 예술" }, { "name": "서양미술의 이해", "group": "문화와 예술" },
    { "name": "서양음악의 이해", "group": "문화와 예술" }, { "name": "스페인어권 문화의 이해", "group": "문화와 예술" }, { "name": "영상예술의 이해", "group": "문화와 예술" },
    { "name": "예술과 과학", "group": "문화와 예술" }, { "name": "예술과 사회", "group": "문화와 예술" }, { "name": "예술의 가치와 비평", "group": "문화와 예술" },
    { "name": "음악 속의 철학", "group": "문화와 예술" }, { "name": "음악과 사회", "group": "문화와 예술" }, { "name": "음악론입문", "group": "문화와 예술" },
    { "name": "종교와 예술", "group": "문화와 예술" }, { "name": "종교와 영화", "group": "문화와 예술" }, { "name": "중국어권의 사회와 문화", "group": "문화와 예술" },
    { "name": "창작의 세계", "group": "문화와 예술" }, { "name": "페미니즘 미학과 예술", "group": "문화와 예술" }, { "name": "프랑스어권 문화의 이해", "group": "문화와 예술" },
    { "name": "한국음악의 이해", "group": "문화와 예술" }, { "name": "한국의 신화", "group": "문화와 예술" }, { "name": "한자와 동양문화", "group": "문화와 예술" },
    { "name": "현대문화와 기독교", "group": "문화와 예술" }, { "name": "현대미술의 이해", "group": "문화와 예술" }, { "name": "현대음악의 이해", "group": "문화와 예술" },
    { "name": "현대종교와 문화", "group": "문화와 예술" },
    {"name": "고고학개론", "group": "역사와 철학" }, { "name": "과학과 비판적 사고", "group": "역사와 철학" }, { "name": "과학의 철학적 이해", "group": "역사와 철학" }, // '이' -> '이해'로 수정 (index.html 기준)
    {"name": "규장각과 한국문화", "group": "역사와 철학" }, { "name": "근대 한국의 역사와 문화", "group": "역사와 철학" }, { "name": "현대 한국민족주의", "group": "역사와 철학" },
    {"name": "기독교와 서양문명", "group": "역사와 철학" }, { "name": "남북분단과 한국전쟁", "group": "역사와 철학" }, { "name": "논리학", "group": "역사와 철학" },
    {"name": "도덕적 추론", "group": "역사와 철학" }, { "name": "도시의 문화사", "group": "역사와 철학" }, { "name": "동서문명의 만남과 실크로드", "group": "역사와 철학" },
    {"name": "동서양의 종교적 지혜", "group": "역사와 철학" }, { "name": "동아시아의 왕권", "group": "역사와 철학" }, { "name": "동양철학의 이해", "group": "역사와 철학" },
    {"name": "매체로 보는 서양사", "group": "역사와 철학" }, { "name": "명상과 수행", "group": "역사와 철학" }, { "name": "문명의 기원", "group": "역사와 철학" },
    {"name": "미학과 예술론", "group": "역사와 철학" }, { "name": "민주주의와 시민의 역사", "group": "역사와 철학" }, { "name": "법과 가치", "group": "역사와 철학" },
    {"name": "불교철학의 이해", "group": "역사와 철학" }, { "name": "사상과 윤리", "group": "역사와 철학" }, { "name": "사회철학의 이해", "group": "역사와 철학" },
    {"name": "생명의료윤리", "group": "역사와 철학" }, { "name": "서양문명의 역사 2", "group": "역사와 철학" }, { "name": "서양미술사입문", "group": "역사와 철학" },
    {"name": "서양철학의 고전", "group": "역사와 철학" }, { "name": "서양철학의 이해", "group": "역사와 철학" }, { "name": "성과 사랑의 역사", "group": "역사와 철학" },
    {"name": "성서와 기독교 사상의 이해", "group": "역사와 철학" }, { "name": "성의 철학과 성윤리", "group": "역사와 철학" }, { "name": "세계종교입문", "group": "역사와 철학" },
    {"name": "신화와 역사", "group": "역사와 철학" }, { "name": "역사 속의 중화와 그 이웃", "group": "역사와 철학" }, { "name": "역사와 역사 재현", "group": "역사와 철학" },
    {"name": "이슬람 문명의 역사", "group": "역사와 철학" }, { "name": "인간과 종교", "group": "역사와 철학" }, { "name": "인공지능과 철학", "group": "역사와 철학" },
    {"name": "인물로 본 한국사", "group": "역사와 철학" }, { "name": "일본의 인물과 역사", "group": "역사와 철학" }, { "name": "조선의 역사적 성취와 유산", "group": "역사와 철학" },
    {"name": "종교학의 이해", "group": "역사와 철학" }, { "name": "중국의 전통과 현대", "group": "역사와 철학" }, { "name": "처음 배우는 서양사", "group": "역사와 철학" },
    {"name": "철학개론", "group": "역사와 철학" }, { "name": "철학으로 예술 보기", "group": "역사와 철학" }, { "name": "테마 중국사", "group": "역사와 철학" },
    {"name": "한국 중세의 사회와 문화", "group": "역사와 철학" }, { "name": "한국고대사의 쟁점", "group": "역사와 철학" }, { "name": "한국문화와 불교", "group": "역사와 철학" },
    {"name": "한국미술사입문", "group": "역사와 철학" }, { "name": "한국사", "group": "역사와 철학" }, { "name": "한국사의 새로운 해석", "group": "역사와 철학" },
    {"name": "한국의 문화유산", "group": "역사와 철학" }, { "name": "한국의 역사가와 역사학", "group": "역사와 철학" }, { "name": "한국현대사의 이해", "group": "역사와 철학" },
    {"name": "현대사회와 윤리", "group": "역사와 철학" }, { "name": "인도의 전통과 현대", "group": "역사와 철학" }, 
    {"name": "디지털시대의 영상문화와 윤리", "group": "인간과 사회" }, { "name": "문화와 질병", "group": "인간과 사회" }, { "name": "미디어와 현대사회", "group": "인간과 사회" },
    {"name": "부모교육", "group": "인간과 사회" }, { "name": "심리학개론", "group": "인간과 사회" }, { "name": "인간관계의 심리학", "group": "인간과 사회" },
    {"name": "일본대중문화", "group": "인간과 사회" }, { "name": "전통과 일상의 한국문화", "group": "인간과 사회" }, { "name": "진화와 인간사회", "group": "인간과 사회" },
    {"name": "함께 사는 법", "group": "인간과 사회" }, { "name": "인공지능과 알고리듬 사회", "group": "인간과 사회" }, { "name": "사회학의 이해", "group": "인간과 사회" },
    {"name": "경제학개론", "group": "정치와 경제" }, { "name": "국가와 시민", "group": "정치와 경제" }, { "name": "국제정치학입문", "group": "정치와 경제" },
    {"name": "글로벌 이슈와 윤리적 사고", "group": "정치와 경제" }, { "name": "남북관계와 통일의 전망", "group": "정치와 경제" }, { "name": "민주시민과 기본적 인권", "group": "정치와 경제" },
    {"name": "법학개론", "group": "정치와 경제" }, { "name": "북한학개론", "group": "정치와 경제" }, { "name": "시민생활의 법적 이해", "group": "정치와 경제" },
    {"name": "시장경제와 법", "group": "정치와 경제" }, { "name": "인간생활과 경제", "group": "정치와 경제" }, { "name": "정치학개론", "group": "정치와 경제" },
    {"name": "한국정치의 분석과 이해", "group": "정치와 경제" }, { "name": "현대경제의 이해", "group": "정치와 경제" }, { "name": "현대사회와 법", "group": "정치와 경제" },
    {"name": "현대정치의 이해", "group": "정치와 경제" }, { "name": "영화 속 세계정치", "group": "정치와 경제" }
];
// 0. '학문의 세계' 5개 영역 전체 목록
const allAcademiaGroups = [
    "언어와 문학",
    "문화와 예술",
    "역사와 철학",
    "인간과 사회",
    "정치와 경제"
];

exports.handler = async (event, context) => {
    try {
        // 1. 클라이언트로부터 데이터 수신
        const { text: allText, checklist: checklistData } = JSON.parse(event.body);

        // 2. 최종 분석 결과를 담을 객체
        const analysisResult = {};

        // ======================================================
        // 3. "전공 필수" 분석 (이전 단계와 동일)
        // ======================================================
        const allRequiredCourses = [
            '의예과신입생세미나', '의학입문', '자유주제탐구',
            '의학연구의 이해', '기초의학통계학 및 실험'
        ];
        const completedRequired = [];
        const remainingRequired = [];
        allRequiredCourses.forEach(course => {
            if (allText.includes(course)) {
                completedRequired.push(course);
            } else {
                remainingRequired.push(course);
            }
        });
        analysisResult["전공 필수"] = {
            description: "총 5개의 전공 필수 과목을 모두 이수해야 합니다.",
            displayType: "list_all",
            completed: completedRequired,
            remaining: remainingRequired
        };

        // ======================================================
        // 4. "전공 선택" 분석 (이전 단계와 동일)
        // ======================================================
        const allElectiveCourses = [
            '국제의학의 이해', '몸 속으로의 여행', '바이오헬스케어와 혁신사고',
            '사례병 질병 진단의 실제', '사회와 의료현장에서의 리빙랩', '세계예술 속 의학의 이해',
            '세포분자생물학', '의대생을 위한 고전읽기', '의료와 데이터사이언스',
            '의생명과학 논문의 이해', '의학연구의 실제', '통일의료'
        ];
        const twoCreditElectives = [
            '국제의학의 이해', '몸 속으로의 여행', '세계예술 속 의학의 이해', '통일의료'
        ];
        const requiredElectiveCredits = 12;
        let totalElectiveCredits = 0;
        const completedElectiveCourses = [];
        const recommendedElectiveCourses = [];
        allElectiveCourses.forEach(course => {
            if (allText.includes(course)) {
                completedElectiveCourses.push(course);
                if (twoCreditElectives.includes(course)) {
                    totalElectiveCredits += 2;
                } else {
                    totalElectiveCredits += 3;
                }
            } else {
                recommendedElectiveCourses.push(course);
            }
        });
        const otherCollegeCredits = (allText.match(/타단과대 전공/g) || []).length;
        if (otherCollegeCredits > 0) {
            totalElectiveCredits += otherCollegeCredits;
            completedElectiveCourses.push(`타단과대 전공 (${otherCollegeCredits}학점)`);
        }
        const remainingCredits = Math.max(0, requiredElectiveCredits - totalElectiveCredits);
        analysisResult["전공 선택"] = {
            description: `12학점 이상 이수해야 합니다. (2학점: 국제의학, 몸속여행, 세계예술, 통일의료 / 3학점: 나머지 전선)`,
            displayType: "credit_count",
            completed: completedElectiveCourses,
            recommended: recommendedElectiveCourses,
            completedCredits: totalElectiveCredits,
            requiredCredits: requiredElectiveCredits,
            remainingCredits: remainingCredits
        };

        // ======================================================
        // 5. "필수 교양" 분석 (이전 단계와 동일)
        // ======================================================
        const fixedLiberalArts = [
            '대학글쓰기 1', '대학글쓰기 2: 과학기술글쓰기', '말하기와 토론',
            '생물학', '생물학실험', '생명과학을 위한 수학/고급수학+수연',
            '화학/고급화학', '화학실험'
        ];
        const foreignLanguageOptions = [
            '대학영어1', '대학영어2', '외국어1', '외국어2'
        ];
        const completedLiberalArts = [];
        const remainingLiberalArts = [];
        fixedLiberalArts.forEach(course => {
            if (allText.includes(course)) {
                completedLiberalArts.push(course);
            } else {
                remainingLiberalArts.push(course);
            }
        });
        let foreignLanguageCount = 0;
        foreignLanguageOptions.forEach(lang => {
            if (allText.includes(lang)) {
                completedLiberalArts.push(lang);
                foreignLanguageCount++;
            }
        });
        const neededLanguages = 2 - foreignLanguageCount;
        if (neededLanguages === 1) {
            remainingLiberalArts.push('영어/외국어 (1과목 추가 필요)');
        } else if (neededLanguages === 2) {
            remainingLiberalArts.push('영어/외국어 (2과목 추가 필요)');
        }
        analysisResult["필수 교양"] = {
            description: "고정 8과목 + 외국어 2과목을 모두 이수해야 합니다.",
            displayType: "list_all",
            completed: completedLiberalArts,
            remaining: remainingLiberalArts
        };

        // ======================================================
        // 6. [요청하신 기능] "학문의 세계" 분석 (★ 신규 구현)
        // ======================================================
        
        const completedAcademiaCourses = []; // 이수한 과목 객체 {name, group}
        const completedGroups = new Set();   // 이수한 영역 (Set: 중복 방지)
        let totalAcademiaCredits = 0;
        const requiredAcademiaCredits = 12;
        const requiredGroupCount = 4;

        // 6-1. 이수한 과목 분류 및 학점, 영역 계산
        allAcademiaCourses.forEach(course => {
            if (allText.includes(course.name)) {
                completedAcademiaCourses.push(course); // {name: "...", group: "..."}
                completedGroups.add(course.group);
                // (가정) '학문의 세계' 과목은 모두 3학점이라고 가정합니다.
                totalAcademiaCredits += 3;
            }
        });

        // 6-2. 미이수 영역 계산
        const remainingGroups = allAcademiaGroups.filter(group => !completedGroups.has(group));
        
        // 6-3. 미이수 영역별 추천 과목 목록 생성 (토글 버튼용)
        const recommendedCoursesByGroup = {};
        if (remainingGroups.length > 0) {
            remainingGroups.forEach(groupName => {
                // 전체 과목 목록에서 해당 그룹 과목만 필터링
                const coursesInGroup = allAcademiaCourses
                    .filter(course => course.group === groupName)
                    .map(course => course.name); // 이름만 추출
                recommendedCoursesByGroup[groupName] = coursesInGroup;
            });
        }

        // 6-4. 결과 객체 생성
        analysisResult["학문의 세계"] = {
            description: "5개 영역 중 4개 영역 이상, 총 12학점 이상 이수해야 합니다. (과목당 3학점으로 계산)",
            displayType: "academia_group_count", // ★ 새로운 displayType
            completedCourses: completedAcademiaCourses, // 이수한 과목 (객체 배열)
            completedGroupCount: completedGroups.size,
            requiredGroupCount: requiredGroupCount,
            totalAcademiaCredits: totalAcademiaCredits,
            requiredCredits: requiredAcademiaCredits,
            remainingGroups: remainingGroups, // 미이수 영역 (문자열 배열)
            recommendedCoursesByGroup: recommendedCoursesByGroup // 미이수 영역별 과목 목록 (객체)
        };


        // ======================================================
        // 7. [TODO] 나머지 항목 분석
        // ======================================================
        analysisResult["예체능"] = {
             description: "3학점 이상 이수 (이 기능은 현재 개발 중)",
            displayType: "count",
            completed: [],
            requiredCount: 2 
        };
        analysisResult["비교과"] = {
            description: "필수 요건 4개 모두, 선택 요건 4개 중 2개 이상 이수",
            displayType: "checklist",
            data: checklistData
        };

        // 8. 최종 분석 결과 반환
        return {
            statusCode: 200,
            body: JSON.stringify(analysisResult)
        };

    } catch (error) {
        console.error("Error in analyze function:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};
