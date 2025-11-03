// 이 파일의 위치: netlify/functions/analyze.js

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
            '의예과신입생세미나',
            '의학입문',
            '자유주제탐구',
            '의학연구의 이해',
            '기초의학통계학 및 실험'
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
        // 5. [요청하신 기능] "필수 교양" 분석 (★ 신규 구현)
        // ======================================================

        // 5-1. 필수 교양 고정 과목 목록 (HTML 체크박스 기준)
        const fixedLiberalArts = [
            '대학글쓰기 1',
            '대학글쓰기 2: 과학기술글쓰기',
            '말하기와 토론',
            '생물학',
            '생물학실험',
            '생명과학을 위한 수학/고급수학+수연',
            '화학/고급화학',
            '화학실험'
        ];

        // 5-2. 외국어 과목 목록 (HTML select 기준)
        const foreignLanguageOptions = [
            '대학영어1',
            '대학영어2',
            '외국어1',
            '외국어2'
        ];

        const completedLiberalArts = []; // 이수한 과목 목록
        const remainingLiberalArts = []; // 미이수 과목 목록

        // 5-3. 고정 과목 8개 체크
        fixedLiberalArts.forEach(course => {
            if (allText.includes(course)) {
                completedLiberalArts.push(course);
            } else {
                remainingLiberalArts.push(course);
            }
        });

        // 5-4. 외국어 과목 2개 체크
        let foreignLanguageCount = 0;
        foreignLanguageOptions.forEach(lang => {
            if (allText.includes(lang)) {
                completedLiberalArts.push(lang); // 이수한 과목 목록에 추가
                foreignLanguageCount++;
            }
        });

        // 5-5. 외국어 요구 조건 (2과목)에 따라 '남은 과목'에 추가
        const requiredForeignLanguages = 2;
        const neededLanguages = requiredForeignLanguages - foreignLanguageCount;

        if (neededLanguages === 1) {
            // 1개만 선택한 경우
            remainingLiberalArts.push('영어/외국어 (1과목 추가 필요)');
        } else if (neededLanguages === 2) {
            // 0개 선택한 경우
            remainingLiberalArts.push('영어/외국어 (2과목 추가 필요)');
        }
        // (neededLanguages가 0이면 2개 다 들은 것이므로 아무것도 추가 안 함)

        // 5-6. 결과 객체 생성
        analysisResult["필수 교양"] = {
            description: "고정 8과목 + 외국어 2과목을 모두 이수해야 합니다.",
            displayType: "list_all", // 이수/미이수 목록을 모두 보여줍니다.
            completed: completedLiberalArts,
            remaining: remainingLiberalArts
        };

        // ======================================================
        // 6. [TODO] 나머지 항목 분석 (우선 빈 값으로 채움)
        // ======================================================
        analysisResult["학문의 세계"] = {
            description: "5개 영역 중 4개 영역 이상, 12학점 이상 이수 (이 기능은 현재 개발 중)",
            displayType: "group_count",
            completed: [], 
            remaining: [], 
            completedCount: 0,
            requiredCount: 4
        };
        
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

        // 7. 최종 분석 결과 반환
        return {
            statusCode: 200,
            body: JSON.stringify(analysisResult)
        };

    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};
