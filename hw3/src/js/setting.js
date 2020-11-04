import Exercise from "./model/exercise.js"



// timed press event
let pressTimer;

// util
Object.prototype.insertAfter = function (newNode, referenceNode) {     
    if (referenceNode != null && referenceNode.nextSibling != null) {
        this.insertBefore(newNode, referenceNode.nextSibling);
    } else {
        this.appendChild(newNode);
    }
};

Array.prototype.move = function(from, to) {
    if (from > to) {
        this.splice(to, 0, this.splice(from, 1)[0]);
    }
    else if (from < to) {
        this.splice(to - 1, 0, this.splice(from, 1)[0]);
    }
};

function zip_map(l1, l2, f) {
    for (let i = 0; i < l1.length; ++i) {
        f(l1[i], l2[i]);
    }
};



// TEST : no sync with "webex_setting.json", so use default setting
function getCurrentSetting() {
    let exercise = (name, interval, count) => {
        let e = new Exercise(name);
        e.on = true;
        e.interval = interval;
        e.count = count;
        return e;
    }
    let list = [
        exercise("와이드 스쿼트", 8, 15),
        exercise("언더 푸시", 4, 20),
        exercise("트라이셉스 킥백", 5, 20),
        exercise("나무 자세", 4, 10),
        exercise("앉아서 무릎 당기기", 5, 15),
        exercise("경첩 자세", 4, 10),
        exercise("플랭크 엉덩이 들기", 5, 8),
        exercise("마운틴 클라이머", 2, 20),
    ];
    return list;
}


let exerciseModel = getCurrentSetting().concat(
    [
        // "경첩 자세",
        // "나무 자세",
        "다리 교차하기",
        "러시안 트위스트",
        "레그 레이즈",
        "링 애로",
        "링 위로 아래로",
        // "마운틴 클라이머",
        "만세 런지 트위스트",
        "만세 스쿼트",
        "만세 앞 숙이기",
        "만세 엉덩이 흔들기",
        "만세 푸시",
        "발장구 치기",
        "백 푸시",
        "보트 자세",
        "사이드 스텝",
        "사이드 앵글 자세",
        "숙여서 비틀기",
        "스쿼트",
        "스탠딩 트위스트",
        // "앉아서 무릎 당기기",
        "암 스핀",
        "암 트위스트",
        // "언더 푸시",
        // "와이드 스쿼트",
        "위로 아래로 콤보",
        "의자 자세",
        "전사1 자세",
        "전사2 자세",
        "전사3 자세",
        // "트라이셉스 킥백",
        // "플랭크 엉덩이 들기",
        "허벅지 들기 콤보",
        "허벅지 들기",
        "허벅지로 푸시",
    ].map(name => new Exercise(name))
);

function getLastOnIndex () {
    let result = exerciseModel.findIndex(exercise => exercise.on == false);
    if (result != -1) result -= 1;
    return result;
}



// HTML 렌더링 템플릿
let tr_template = (exercise) => {
    return (
        `<td><input type="checkbox"></td>` +
        `<td><div class="exercise-wrapper flexbox-row">
            <img src="${exercise.iconURL}">
            <h3>${exercise.name}</h3>
        </div></td>` +
        `<td>
            <div>1회시간:  <inline class="on">${exercise.interval}</inline>
                        <input type="number" name="interval" value="${exercise.interval}" min="1"></input> 초
            </div><br>
            
            <div>1세트당:  <inline class="on">${exercise.count}</inline>
                        <input type="number" name="count" value="${exercise.count}" min="1"></input> 회
            </div>

        </td>` + 
        `<td>
            <div class="edit-button on">✎</div> 
            <div class="drag-button flexbox-column">
                <div class="up">▲</div>
                <hr><hr>
                <div class="down">▼</div>
            </div>
        </td>`
    );
};



function loadSetting() {
    /*
        Setting View
    */   
    let root_elem = document.getElementById("setting");
    let table_elem = document.getElementById("exercise-table");
    let thead = table_elem.getElementsByTagName("thead")[0];
    let tbody = table_elem.getElementsByTagName("tbody")[0];
    let popup_wrapper_element = root_elem.getElementsByClassName("popup-wrapper")[0];
    let popup_element = root_elem.getElementsByClassName("popup")[0];


    // Each Row rendering
    let on_list = [];
    exerciseModel.forEach((exercise, index) => {
        tbody.insertRow(index);
        let tr_element = tbody.rows[index];
        tr_element.innerHTML = tr_template(exercise);

        let checkbox = tr_element.cells[0].getElementsByTagName("input")[0];
        let exercise_element = tr_element.cells[1].getElementsByClassName("exercise-wrapper")[0];
        let inline_elems = tr_element.cells[2].getElementsByTagName("inline");
        let input_elems = tr_element.cells[2].getElementsByTagName("input");
        let edit_button = tr_element.cells[3].getElementsByClassName("edit-button")[0];
        let drag_up_button = tr_element.cells[3].querySelector(".drag-button .up");
        let drag_down_button = tr_element.cells[3].querySelector(".drag-button .down");

        // 모두 렌더링 된 후에 checkbox를 클릭하기 위해 잠시 저장함
        if (exercise.on) {
            on_list.push(checkbox);
        }

        function getRowElem(index) {
            return tbody.getElementsByTagName("tr")[index];
        }

        let MoveType = Object.freeze({
            ON: 0,
            OFF: 1,
            UP: 2,
            DOWN: 3,
        });

        function moveExercise(moveType) {
            let current_index = exerciseModel.indexOf(exercise);
            let last_on_index;
            switch (moveType) {
                case MoveType.ON:
                    last_on_index = getLastOnIndex();
                    exercise.on = true;
                    tr_element.classList.add('on');
                    if (last_on_index != -1) {
                        getRowElem(last_on_index).classList.remove("last-on");
                        tr_element.classList.add("last-on");
                        moveExerciseBefore(current_index, last_on_index + 1);
                    }
                    else {
                        tr_element.classList.add("last-on");
                        moveExerciseBefore(current_index, 0);
                    }
                    break;
                case MoveType.OFF:
                    last_on_index = getLastOnIndex();
                    exercise.on = false;
                    tr_element.classList.remove('on');
                    if (current_index == last_on_index) {
                        tr_element.classList.remove("last-on");
                        if (current_index != 0) {
                            getRowElem(current_index - 1).classList.add("last-on");
                        }
                    }
                    else {
                        moveExerciseBefore(current_index, last_on_index + 1);
                    }
                    break;
                case MoveType.UP:
                    // previousElementSibling이 없으면 활성화되지 않음, 그래도 에러처리 하는게 좋긴 할듯
                    if (tr_element.classList.contains("last-on")) {
                        tr_element.classList.remove("last-on");
                        tr_element.previousElementSibling.classList.add("last-on");
                    }
                    moveExerciseBefore(current_index, current_index - 1);
                    break;
                case MoveType.DOWN:
                    // nextElementSibling이 없으면 활성화되지 않음, 그래도 에러처리 하는게 좋긴 할듯
                    if (tr_element.nextElementSibling.classList.contains("last-on")) {
                        tr_element.nextElementSibling.classList.remove("last-on");
                        tr_element.classList.add("last-on");
                    }
                    moveExerciseBefore(current_index, current_index + 2);
                    break;
            }
        }
        
        function moveExerciseBefore(exercise_idx, ref_exercise_idx) {
            let ref_element;
            if (ref_exercise_idx < exerciseModel.length) {
                ref_element = getRowElem(ref_exercise_idx);
            }
            else {
                ref_exercise_idx = null;
                ref_element = null;
            }
            exerciseModel.move(exercise_idx, ref_exercise_idx);
            tbody.insertBefore(tr_element, ref_element);
        }

        

        // 체크 박스의 클릭 여부에 따라 onoff 조절, 순서 조절
        checkbox.onchange = (event) => {
                moveExercise(checkbox.checked? MoveType.ON : MoveType.OFF);            
        };

        // 편집버튼 조정
        edit_button.onclick = (event) => {
            // 클래스가 on일때만 작동
            if (tr_element.classList.contains("on")) {
                // 이미 편집모드일때
                if (edit_button.classList.contains("highlight")) {
                    edit_button.classList.remove("highlight");
                    zip_map(inline_elems, input_elems, (inline, input) => {
                        inline.classList.add("on");
                        input.classList.remove("on");
                        inline.innerHTML = input.value;
                        exercise[input.name] = parseInt(input.value);
                    });
    
                }
                // 편집 모드가 아니었을때
                else {
                    edit_button.classList.add("highlight");
                    zip_map(inline_elems, input_elems, (inline, input) => {
                        inline.classList.remove("on");
                        input.classList.add("on");
                        // input.value = inline.innerHTML;
                    });
                }
            }
        };

        // 드래그버튼 조정
        drag_up_button.onclick = (event) => {
            moveExercise(MoveType.UP);
        };

        drag_down_button.onclick = (event) => {
            moveExercise(MoveType.DOWN);
        };

        // long press시 information 팝업창 로드
        let render_popup = (exercise) => {
            popup_element.children[0].innerHTML = exercise.name;
            popup_element.children[1].children[0].src = exercise.movieURL;
            popup_wrapper_element.classList.add('show');
        };

        exercise_element.onmouseup = (event) => {
            clearTimeout(pressTimer);
        };
        exercise_element.ontouchend = (event) => {
            clearTimeout(pressTimer);
        };

        exercise_element.onmousedown = (event) => {
            pressTimer = window.setTimeout(() => { render_popup(exercise); }, 1000);
        };
        exercise_element.ontouchstart = (event) => {
            pressTimer = window.setTimeout(() => { render_popup(exercise); }, 1000);
        };

        // 닫기 버튼 클릭시 팝업창 닫힘
        popup_element.querySelector(".back").onclick = (event) => {
            popup_wrapper_element.classList.remove('show');
        };
    });

    // 헤더에서 버튼 누를시 편집-드래그 전환
    let headerEditButton = thead.getElementsByClassName("edit-button")[0];
    let headerDragButton = thead.getElementsByClassName("drag-button")[0];
    let bodyEditButtons = tbody.getElementsByClassName("edit-button");
    let bodyDragButtons = tbody.getElementsByClassName("drag-button");

    // edit 상태에서 버튼 누르면 drag로 전환
    headerEditButton.onclick = (event) => {
        headerEditButton.classList.remove("on");
        headerDragButton.classList.add("on");

        zip_map(bodyEditButtons, bodyDragButtons, (edit_elem, drag_elem) => {
            if (edit_elem.classList.contains("highlight")) {
                edit_elem.click();
            }
            edit_elem.classList.remove("on");
            drag_elem.classList.add("on");
        });
    };
    // drag 상태에서 버튼 누르면 edit로 전환
    headerDragButton.onclick = (event) => {
        headerDragButton.classList.remove("on");
        headerEditButton.classList.add("on");

        zip_map(bodyEditButtons, bodyDragButtons, (edit_elem, drag_elem) => {
            drag_elem.classList.remove("on");
            edit_elem.classList.add("on");
        });
    }

    // setting 모델 중 on인 exercise의 checkbox를 클릭, 이전에 킵해둔 on_list를 사용한다.
    for (let checkbox of on_list) {
        checkbox.click();
    }
}

window.onload = function() {
    loadSetting();
};

