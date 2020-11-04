import Exercise from "./model/exercise.js"
import IntervalTimer from "./model/intervalTimer.js"


// util
const Today = (new Date()).toISOString().slice(0,10).replace(/-/g,"");

function htmlToElement(html) {
    let template = document.createElement('template');
    html = html.trim();
    template.innerHTML = html;
    return template.content.firstChild;
} 

// audio
const Sound_Tick = new Audio("./rsc/tick.mp3");
const Sound_Tock = new Audio("./rsc/tock.mp3");
const Sound_LastOne = new Audio("./rsc/lastone.mp3");
const Sound_GoodJob = new Audio("./rsc/goodjob.mp3");


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

let exercise_template = (exercise) => {
    return (
        `<div class="item flexbox-column">
            <img src="${exercise.iconURL}">
            <h6>${exercise.name}</h6>
        </div>`
    );
};


let ExerciseMode = Object.freeze({
    Ready: 0,
    Playing: 1, 
    Pause: 2,
    Finished: 3,
});

let currentMode = null;
let exerciseQueue = null;
let currentExercise = null;
let exerciseTimer = null;
let remainInterval = -1;
let exerciseCount = 0;

let exercise_size_elem = document.querySelector("#exercise-queue .size");
let exercise_queue_elem = document.querySelector("#exercise-queue .queue");
let item_elem = document.querySelector("#exercise-main .item");
let title_elem = item_elem.children[1];
let img_elem = item_elem.children[0].children[0];
let img_text_elem = item_elem.children[0].children[1];
let skip_elem = item_elem.children[2];
let counter_elem = document.querySelector("#exercise-main .counter");
let counter_left_elem = counter_elem.getElementsByTagName("inline")[0];
let counter_right_elem = counter_elem.getElementsByTagName("inline")[1];

let isPlaying = () => item_elem.classList.contains("playing");

let outputJsonLog = {};
outputJsonLog[Today] = {};
for (let exercise of getCurrentSetting()) {
    outputJsonLog[Today][exercise.name] = 0;
}

// exerciseQueue에서 임의로 한개 빼기
function popExerciseQueue() {
    if (exerciseQueue.length > 0) {
        let exercise = exerciseQueue.shift();
        exercise_size_elem.innerHTML = `${exerciseQueue.length}개`;
        exercise_queue_elem.removeChild(exercise_queue_elem.children[0]);
        return exercise;
    }
    else {
        return null;
    }
}

// exercise를 main view에 올려놓고 ready하기
function loadMainExercise(exercise) {   
    currentExercise = exercise;
    title_elem.innerHTML = exercise.name;
    img_elem.src = exercise.iconURL;
    counter_left_elem.innerHTML = "0";
    counter_right_elem.innerHTML = exercise.count.toString();

    remainInterval = exercise.interval;
    exerciseCount = 0;
    exerciseTimer = new IntervalTimer(() => {
        remainInterval -= 1;
        if (remainInterval > 0) {
            img_text_elem.innerHTML = remainInterval.toString();
            Sound_Tock.play();
        }
        else {
            finishInterval();
            return;
        }
    }, 1000);
}

// step을 넘김. 위 두 함수를 합친 편의함수
function doNextExercise() {
    let next = popExerciseQueue();
    if (next) {
        loadMainExercise(next);
        return true;
    }
    else {
        return false;
    }
}

// 카운트 세는걸 멈추고, 횟수를 1 올리거나 다음 운동으로 넘어감
function finishInterval() {
    exerciseCount += 1;
    outputJsonLog[Today][currentExercise.name] += 1;
    counter_left_elem.innerHTML = exerciseCount.toString();
    
    if (exerciseCount < currentExercise.count) {
        remainInterval = currentExercise.interval;
        img_text_elem.innerHTML = remainInterval.toString();
        exerciseTimer.clear();
        exerciseTimer.start();
        Sound_Tick.play();
        if (exerciseCount + 1 == currentExercise.count) {
            Sound_LastOne.play();
        }
    }
    else {
        Sound_GoodJob.play();
        changeMode(ExerciseMode.Ready);
    }
}

// 모드 전환
function changeMode(nextMode) {
    // if (currentMode == nextMode) return;

    // 이전 노드 종료
    switch (currentMode) {
        case (ExerciseMode.Ready):
            item_elem.classList.remove("ready");
            img_text_elem.innerHTML = "";
            break;
        case (ExerciseMode.Playing):
            item_elem.classList.remove("playing");
            img_text_elem.innerHTML = "";
            exerciseTimer.pause();
            break;
        case (ExerciseMode.Pause):
            item_elem.classList.remove("pause");
            img_text_elem.innerHTML = "";
            break;
        default: break;
    }

    // 새로운 현재 노드 설정
    const beforeMode = currentMode;
    currentMode = nextMode;
    switch (nextMode) {
        case (ExerciseMode.Ready):
            item_elem.classList.add("ready");
            img_text_elem.innerHTML = "▶";

            if (!doNextExercise()) {
                changeMode(ExerciseMode.Finished);
                return;
            }
            break;
        case (ExerciseMode.Playing):
            item_elem.classList.add("playing");
            img_text_elem.innerHTML = remainInterval.toString();

            if (beforeMode == ExerciseMode.Ready) {
                exerciseTimer.start();
                Sound_Tick.play();
            }
            else {
                exerciseTimer.resume();
            }
            break;
        case (ExerciseMode.Pause):
            item_elem.classList.add("pause");
            img_text_elem.innerHTML = "Pause";
            break;
        case (ExerciseMode.Finished):
            item_elem.classList.add("finished");
            img_text_elem.innerHTML = "Finished";
            console.log(outputJsonLog);
            break;
        default: break;
    }
}

function loadStart() {
    // exerciseQueue 초기 세팅
    exerciseQueue = getCurrentSetting().slice();
    exercise_size_elem.innerHTML = `${exerciseQueue.length}개`;
    for (let exercise of exerciseQueue) {
        let new_item = htmlToElement(exercise_template(exercise));
        exercise_queue_elem.appendChild(new_item);
    }

    // 이미지 클릭시 모드 변경 처리
    img_text_elem.addEventListener("click", (event) => { img_elem.click(); });
    img_elem.addEventListener("click", (event) => {
        if (isPlaying()) {
            changeMode(ExerciseMode.Pause);
        }
        else {
            changeMode(ExerciseMode.Playing);
        }
    });

    // 스킵버튼 누르면 다음 exercise로
    skip_elem.addEventListener("click", (event) => {
        changeMode(ExerciseMode.Ready);
    });
    
    changeMode(ExerciseMode.Ready);
}

window.onload = function() {
    loadStart();
};
