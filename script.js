// ❗️가장 먼저 매뉴얼을 읽고, 매뉴얼을 참고해 코드를 보는 것을 추천드립니다.❗️
// 매뉴얼에도 적어놨지만, 자칫 잘못 바꾸면 사이트가 완전히 셧다운될 수 있습니다.
// 그러니 수정해야 할 부분이 생길 경우, 교육국 단톡방에 보고 후 조치 부탁드립니다.
// 모르겠을 땐 gemini에게 물어보는걸 추천드립니다!

const analyzeButton = document.getElementById('analyze-button');
const resultArea = document.getElementById('result-area');
const loadingIndicator = document.getElementById('loading');

const electiveSelectElement = document.getElementById('elective-courses-select');
const choices = new Choices(electiveSelectElement, {
    removeItemButton: true,
    placeholder: true,
    placeholderValue: '수강한 과목을 검색 및 선택하세요',
    searchPlaceholderValue: '과목 검색...',
    duplicateItemsAllowed: false,
});
const academiaSelectElement = document.getElementById('foundations-of-academia-select');
const academiaChoices = new Choices(academiaSelectElement, {
    removeItemButton: true,
    placeholder: true,
    placeholderValue: '수강한 지성 교양 과목을 검색 및 선택하세요',
    searchPlaceholderValue: '과목 검색...',
});

// 💡 수정: 예체능 1/2학점 목록 초기화 (ID: arts-and-sports-select-1-2)
const artsSelectElement_1_2 = document.getElementById('arts-and-sports-select-1-2');
const artsChoices_1_2 = new Choices(artsSelectElement_1_2, {
    removeItemButton: true,
    placeholder: true,
    placeholderValue: '1/2학점 강의 선택',
    searchPlaceholderValue: '과목 검색...',
});

// 💡 수정: 예체능 3학점 목록 초기화
const artsSelectElement_3 = document.getElementById('arts-and-sports-select-3');
const artsChoices_3 = new Choices(artsSelectElement_3, {
    removeItemButton: true,
    placeholder: true,
    placeholderValue: '3학점 강의 선택',
    searchPlaceholderValue: '과목 검색...',
});

// 💡 수정: 외국어 목록 초기화
const languageSelectElement = document.getElementById('foreign-language-select');
const languageChoices = new Choices(languageSelectElement, {
    removeItemButton: true,
    placeholder: true,
    placeholderValue: '수강한 외국어 과목을 검색 및 선택하세요',
    searchPlaceholderValue: '과목 검색...',
    maxItemCount: 2,
    maxItemText: (maxItemCount) => `2개까지만 선택할 수 있습니다.`,
});

analyzeButton.addEventListener('click', async () => {
    
    loadingIndicator.classList.remove('hidden');
    resultArea.innerHTML = '';
    
    try {
        const completedCourses = [];

        document.querySelectorAll('#required-courses-list input[type="checkbox"]:checked').forEach(checkbox => {
            completedCourses.push(checkbox.value);
        });
        const selectedElectives = choices.getValue(true);
        completedCourses.push(...selectedElectives);
        
        // 필수 교양 (체크박스) 값 수집
        document.querySelectorAll('#liberal-arts-courses-list input[type="checkbox"]:checked').forEach(checkbox => {
             completedCourses.push(checkbox.value);
        }); 
        
        const selectedLanguages = languageChoices.getValue(true);
        completedCourses.push(...selectedLanguages);
        
        // 4. 지성의 열쇠 & 지성의 확장 값 수집
        const selectedAcademia = academiaChoices.getValue(true);
        completedCourses.push(...selectedAcademia);
        
        // 5. 베리타스 단일 체크박스 값 수집
        const veritasCheckbox = document.getElementById('veritas-completed-check');
        if (veritasCheckbox && veritasCheckbox.checked) {
            completedCourses.push(veritasCheckbox.value); 
        }
        
        // 6. 예체능 1/2학점 목록의 값 수집
        const selectedArts_1_2 = artsChoices_1_2.getValue(true);
        completedCourses.push(...selectedArts_1_2);

        // 6. 예체능 3학점 목록의 값 수집 (고유 value 포함)
        const selectedArts_3 = artsChoices_3.getValue(true);
        completedCourses.push(...selectedArts_3);

        // 💡 기타 및 음미대 학점 수집 (index.html에서 id가 extra-credits-input인 요소를 찾아서 처리)
        const extraCreditsInput = document.getElementById('extra-credits-input');
        if (extraCreditsInput && extraCreditsInput.value) {
             const count = parseInt(extraCreditsInput.value, 10) || 0;
             for (let i = 0; i < count; i++) {
                 completedCourses.push('기타 학점'); // 1학점 = "기타 학점" 문자열 1개
             }
        }
        
        const extraAnSCheckbox = document.getElementById('extra-artsandsports-checkbox');
        const extraAnSCountInput = document.getElementById('extra-artsandsports-count'); 
        if (extraAnSCheckbox && extraAnSCheckbox.checked && extraAnSCountInput && extraAnSCountInput.value) {
            const count = parseInt(extraAnSCountInput.value, 10) || 0;
            for (let i = 0; i < count; i++) {
                completedCourses.push('음미대, 미학과 전공/교양');
            }
        }

        // 💡 중요: 정규식 매칭을 위해 각 과목명 주변에 공백을 추가하여 안정성 확보
        const allText = ' ' + completedCourses.join(' ') + ' ';
        
        const checklistData = {
            'volunteer': document.getElementById('volunteer').checked,
            'cpr': document.getElementById('cpr').checked,
            'leadership': document.getElementById('leadership').checked,
            'reading': document.getElementById('reading').checked,
            'human': document.getElementById('human').checked,
            'study': document.getElementById('study').checked,
            'cpm': document.getElementById('cpm').checked,
            'teps': document.getElementById('teps').checked,
        };

        const response = await fetch('/api/analyze', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: allText, checklist: checklistData }),
        });

        if (!response.ok) {
            const errorResponse = await response.json();
            throw new Error(errorResponse.error || '서버 응답 오류'); 
        }

        const responseData = await response.json();
        displayResults(responseData.analysisResult); 

    } catch (error) {
        console.error('분석 중 오류 발생:', error);
        resultArea.innerHTML = `<p class="error">분석에 실패했습니다. 모든 항목을 올바르게 선택/입력했는지 확인해주세요. (오류: ${error.message})</p>`;
    } finally {
        loadingIndicator.classList.add('hidden');
    }
});

function displayResults(data) {
    let html = `
        <div class="result-header">
            <h2>🔍 분석 결과</h2>
            <button id="capture-button" class="toggle-button save-button" onclick="captureResults()">
                결과 이미지로 저장 📸
            </button>
        </div>`;
    
    const categoryOrder = [
        "전공 필수", "전공 선택", "필수 교양", 
        "지성의 열쇠 & 지성의 확장", "베리타스", "예체능", "초과 학점 합산",
        "필수 수료 요건", "선택 수료 요건"
    ];
    
    if (!data) {
        resultArea.innerHTML = '<p class="error">분석 결과를 받아오는 데 실패했습니다.</p>';
        return;
    }

    for (const category of categoryOrder) {
        if (!data[category]) continue;
        const details = data[category];
        
        html += `<div class="category-result"><h3>${category}</h3>`;
        if (details.description) {
            html += `<p class="description">${details.description}</p>`;
        }
        html += `<div class="result-content">`;

        switch (details.displayType) {
            case 'list_all':
                html += `<p><strong>✅ 이수한 과목:</strong> ${details.completed.length > 0 ? details.completed.join(', ') : '없음'}</p>`;
                html += `<p><strong>📝 미이수 과목:</strong> ${details.remaining.length > 0 ? details.remaining.join(', ') : '없음'}</p>`;
                break;

            case 'list_remaining_custom':
                const remainingItems = details.remaining.map(item => (typeof item === 'object' && item !== null) ? "외국어 (택1)" : item);
                const uniqueRemainingItems = [...new Set(remainingItems)];
                html += `<p><strong>📝 미이수 항목:</strong> ${uniqueRemainingItems.length > 0 ? uniqueRemainingItems.join(', ') : '모두 이수 완료'}</p>`;
                break;

            case 'count':
                const completedCount = details.completed.length;
                const requiredCount = details.requiredCount;
                const isCompleted = completedCount >= requiredCount;
                const neededCount = Math.max(0, requiredCount - completedCount);
                html += `<p class="summary ${isCompleted ? 'completed' : 'in-progress'}"><strong>상태: ${requiredCount}개 중 ${completedCount}개 이수 (${neededCount}개 남음) ${isCompleted ? '✔️' : ''}</strong></p>`;
                if (completedCount > 0) {
                    html += `<p><strong>✅ 이수한 과목:</strong> ${details.completed.join(', ')}</p>`;
                }
                break;
case 'credit_count':
                const isCreditsCompleted = details.remainingCredits === 0;
                html += `<p class="summary ${isCreditsCompleted ? 'completed' : 'in-progress'}"><strong>상태: ${details.requiredCredits}학점 중 ${details.completedCredits}학점 이수 (${details.remainingCredits}학점 남음) ${isCreditsCompleted ? '✔️' : ''}</strong></p>`;
                if (details.completed.length > 0) html += `<p><strong>✅ 이수한 과목:</strong> ${details.completed.join(', ')}</p>`;
                if (details.recommended.length > 0 && !isCreditsCompleted) {
                    const safeCategoryName = 'category-' + encodeURIComponent(category);
                    const elementId = `courses-list-${safeCategoryName}`;
                    html += `<div class="recommendation-area single-button-area">`;
                    html += `<strong>💡 수강 가능 과목 (클릭하여 확인):</strong>`;
                    html += `<button class="toggle-button" onclick="toggleCourseList('${elementId}')">〈${category}〉 과목 목록</button>`;
                    const courseListHtml = details.recommended.map(c => `<li>${c}</li>`).join('');
                    html += `<div id="${elementId}" class="course-list-hidden"><ul class="recommended-list">${courseListHtml}</ul></div>`;
                    html += `</div>`;
                }
                break;

case 'academia_extension_group_count': 
    const isGroupMet = details.isGroupMet;  
    const totalCoreGroups = details.requiredGroupCount;
    const completedCoreGroups = details.completedGroupCount;
    const remainingGroupsCount = Math.max(0, totalCoreGroups - completedCoreGroups);  
    const totalExtensionCourses = details.completedExtensionCourses.length;

    // 1. 💡 필수 영역 충족 여부만 간결하게 표시
    html += `<p class="summary ${isGroupMet ? 'completed' : 'in-progress'}">
                <strong>지성의 열쇠 (3개 영역): ${totalCoreGroups}개 영역 중 ${completedCoreGroups}개 완료 (${remainingGroupsCount}개 남음) ${isGroupMet ? '✔️' : ''}</strong>
            </p>`;
    // 2. 지성의 확장 학점 (새로운 정보) - 유지
    html += `<p class="summary completed"><strong>지성의 확장 학점: ${details.totalExtensionCredits}학점 이수 (총 ${totalExtensionCourses}과목)</strong></p>`;  
    
    // 4. 이수한 과목 상세 - 유지
    if (details.completedAcademiaCourses.length > 0) {
        const completedAcademiaList = details.completedAcademiaCourses.map(c => `${c.name} (${c.group})`).join(', ');
        html += `<p><strong>✅ 지성의 열쇠 이수 과목 (4개 영역 분류):</strong> ${completedAcademiaList}</p>`;
    }
    if (details.completedExtensionCourses.length > 0) {
        const completedExtensionList = details.completedExtensionCourses.map(c => `${c.name} (${c.credit}학점)`).join(', ');
        html += `<p><strong>✅ 지성의 확장 이수 과목:</strong> ${completedExtensionList}</p>`;
    }

    // 5. 미이수 영역 안내 - 유지
    if (!isGroupMet && details.remainingGroups.length > 0) {
        html += `<p><strong>📝 채워야 할 영역:</strong> ${details.remainingGroups.join(', ')}</p>`;
        html += '<div class="recommendation-area multi-button-area">';
        html += '<strong>💡 영역별 들을 수 있는 교양 (클릭하여 확인):</strong>';
        for (const groupName of details.remainingGroups) {
            const elementId = `courses-list-${encodeURIComponent(groupName)}`;
            html += `<button class="toggle-button" onclick="toggleCourseList('${elementId}')">〈${groupName}〉 과목 목록</button>`;
        }
        for (const groupName of details.remainingGroups) {
            const elementId = `courses-list-${encodeURIComponent(groupName)}`;
            const coursesInGroup = details.recommendedCoursesByGroup[groupName] || [];
            const courseListHtml = coursesInGroup.map(c => `<li>${c}</li>`).join('');
            html += `<div id="${elementId}" class="course-list-hidden">
                        <h4 class="list-title"><span class="highlight">〈${groupName}〉 과목 목록</span></h4>
                        <ul class="recommended-list">${courseListHtml}</ul>
                    </div>`;
        }
        html += '</div>';
    }
    break;

            case 'credit_count_simple':
                const isOtherCompleted = details.remainingCredits === 0;
                html += `<p class="summary ${isOtherCompleted ? 'completed' : 'in-progress'}"><strong>상태: ${details.requiredCredits}학점 중 ${details.completedCredits}학점 이수 (${details.remainingCredits}학점 남음) ${isOtherCompleted ? '✔️' : ''}</strong></p>`;
                break;
                
            case 'simple_checklist':
                const completedItems = details.completed.map(key => details.labels[key]);
                html += `<p><strong>✅ 완료한 요건:</strong> ${completedItems.length > 0 ? completedItems.join(', ') : '없음'}</p>`;
                
                let remainingHtml = '';
                if (details.remaining.length > 0) {
                    details.remaining.forEach(key => {
                        const label = details.labels[key];
                        
                        if (key === 'volunteer') {
                            remainingHtml += `<li class="requirement-item">${label} 
                                <a href="https://www.1365.go.kr/vols/main.do" target="_blank" class="requirement-link">
                                    <br>봉사 시간 확인하러 가기 (*의료봉사만 인정)
                                </a></li>`;
                        } else if (key === 'cpr') {
                            remainingHtml += `<li class="requirement-item">${label} 
                                <a href="https://health4u.snu.ac.kr/healthCare/CPR/_/view.do" target="_blank" class="requirement-link">
                                    CPR 교육 신청하러 가기
                                </a></li>`;
                        } else {
                            remainingHtml += `<li class="requirement-item">${label}</li>`;
                        }
                    });
                    html += `<p style="margin-top:10px;"><strong>📝 남은 요건:</strong></p><ul class="requirement-list">${remainingHtml}</ul>`;
                } else {
                    html += `<p><strong>📝 남은 요건:</strong> 모두 완료</p>`;
                }
                break;


            case 'count_checklist':
                const isElecCompleted = details.neededCount === 0;
                html += `<p class="summary ${isElecCompleted ? 'completed' : 'in-progress'}">
                             <strong>상태: ${details.requiredCount}개 이상 중 ${details.completedCount}개 완료 (${details.neededCount}개 더 필요) ${isElecCompleted ? '✔️' : ''}</strong>
                         </p>`;
                
                if (details.completed.length > 0) {
                    const completedElecList = details.completed.map(key => details.labels[key]);
                    html += `<p><strong>✅ 완료한 요건:</strong> ${completedElecList.join(', ')}</p>`;
                }
                break;
        }
        html += `</div></div>`;
    }
    resultArea.innerHTML = html;
}


function toggleCourseList(elementId) {
    const clickedElement = document.getElementById(elementId);
    if (!clickedElement) return; 

    const isAlreadyVisible = clickedElement.classList.contains('visible');

    const allOpenLists = document.querySelectorAll('.course-list-hidden.visible');
    allOpenLists.forEach(list => {
        list.classList.remove('visible');
    });

    if (!isAlreadyVisible) {
        clickedElement.classList.add('visible');
    }
}
// ❗️❗️ [추가] 캡쳐 기능 함수 ❗️❗️
/**
 * 'result-area' div를 캡쳐하여 '졸업요건_분석결과.png'로 저장합니다.
 */
function captureResults() {
    const captureButton = document.getElementById('capture-button');
    if (captureButton) {
        captureButton.innerText = '저장 중...';
        captureButton.disabled = true;
    }

    const resultArea = document.getElementById('result-area');
    
    // 캡쳐 시 해상도를 2배로 높여 선명하게 저장
    html2canvas(resultArea, { scale: 2 }) 
        .then(canvas => {
            // 임시 링크 생성
            const link = document.createElement('a');
            link.href = canvas.toDataURL('image/png');
            link.download = '졸업요건_분석결과.png';
            
            // 링크 클릭 (다운로드) 및 제거
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // 버튼 텍스트 복구
            if (captureButton) {
                captureButton.innerText = '결과 이미지로 저장';
                captureButton.disabled = false;
            }
        })
      .catch(err => {
            console.error('캡쳐 중 오류 발생:', err);
            if (captureButton) {
                captureButton.innerText = '저장 실패. 다시 시도하세요.';
                captureButton.disabled = false;
            }
        });
}
ctor('input[type="number"]');
        if (inputNumber) {
            inputNumber.style.flexShrink = '0';
        }
    }
    
    // 4. h4 태그 (제목) 왼쪽 정렬 (index.html에서 직접 수정하는 것을 대체)
    document.querySelectorAll('.course-section h4').forEach(h4 => {
        h4.style.textAlign = 'left';
        h4.style.marginTop = '15px'; 
    });
}

window.addEventListener('DOMContentLoaded', applyLayoutFix);
