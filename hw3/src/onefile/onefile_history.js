
// util
const Today = (new Date()).toISOString().slice(0,10).replace(/-/g,"");

function htmlToElement(html) {
    let template = document.createElement('template');
    html = html.trim(); // Never return a text node of whitespace as the result
    template.innerHTML = html;
    return template.content.firstChild;
} 


// TEST : no sync with "webex_log.json", so use default log
function getCurrentLog() {
    return {
        "20201029": {
            "와이드 스쿼트": 100,
            "언더 푸시": 80,
            "트라이셉스 킥백": 100,
            "나무 자세": 40,
            "앉아서 무릎 당기기": 70,
            "경첩 자세": 40,
            "플랭크 엉덩이 들기": 40,
            "마운틴 클라이머": 40,
        },
        "20201030": {
            "와이드 스쿼트": 100,
            "언더 푸시": 80,
            "트라이셉스 킥백": 100,
            "나무 자세": 40,
            "앉아서 무릎 당기기": 70,
            "경첩 자세": 40,
            "플랭크 엉덩이 들기": 40,
            "마운틴 클라이머": 40,
        },
        "20201031": {
            "와이드 스쿼트": 120,
            "언더 푸시": 70,
            "트라이셉스 킥백": 100,
            "나무 자세": 40,
            "앉아서 무릎 당기기": 60,
            "경첩 자세": 40,
            "플랭크 엉덩이 들기": 40,
            "마운틴 클라이머": 40,
        },
        "20201101": {
            "와이드 스쿼트": 120,
            "언더 푸시": 80,
            "트라이셉스 킥백": 100,
            "나무 자세": 40,
            "앉아서 무릎 당기기": 75,
            "경첩 자세": 40,
            "플랭크 엉덩이 들기": 40,
            "마운틴 클라이머": 40,
        },
        "20201102": {
            "와이드 스쿼트": 120,
            "언더 푸시": 80,
            "트라이셉스 킥백": 100,
            "나무 자세": 40,
            "앉아서 무릎 당기기": 0,
            "경첩 자세": 0,
            "플랭크 엉덩이 들기": 0,
            "마운틴 클라이머": 0,
        },
        "20201103": {
            "와이드 스쿼트": 40,
            "언더 푸시": 80,
            "트라이셉스 킥백": 100,
            "나무 자세": 10,
            "앉아서 무릎 당기기": 0,
            "경첩 자세": 20,
            "플랭크 엉덩이 들기": 10,
            "마운틴 클라이머": 30,
        },
        "20201104": {
            "와이드 스쿼트": 20,
            "언더 푸시": 80,
            "트라이셉스 킥백": 60,
            "나무 자세": 5,
            "앉아서 무릎 당기기": 0,
            "경첩 자세": 0,
            "플랭크 엉덩이 들기": 0,
            "마운틴 클라이머": 30,
        },
    }
}


function scaleWeekLog(week_log) {
    let exercise_name_set = new Set();
    for (let day of Object.keys(week_log)) {
        for (let exercise_name of Object.keys(week_log[day])) {
            exercise_name_set.add(exercise_name);
        }
    }

    let scaled_week_log = JSON.parse(JSON.stringify(week_log));
    for (let day of Object.keys(week_log)) {
        let keys = Object.keys(week_log[day]);
        for (let exercise_name of exercise_name_set) {
            if (!keys.includes(exercise_name)) {
                scaled_week_log[day][exercise_name] = 0;
            }
        }
    }
    return scaled_week_log;
}


function loadHistory() {
    let today_log = getCurrentLog()[Today];
    let today_exercise_name_list = Object.keys(today_log);

    let highcharts_today = Highcharts.chart('highcharts-today', {
        title: {
            text: '오늘의 운동'
        },

        subtitle: { text: Today },

        xAxis: {
            categories: today_exercise_name_list,
        },
        
        yAxis: {
            title: { text: "횟수" },
        },

        legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'middle',
        },

        series: [{
            type: 'column',
            showInLegend: false,
            data: today_exercise_name_list.map(name => today_log[name]),
        }, ],
    });


    let week_log = scaleWeekLog(getCurrentLog());
    let week_day_list = Object.keys(week_log).sort();
    let week_exercise_name_list = Object.keys(week_log[Today]);

    let highcharts_week = Highcharts.chart('highcharts-week', {
        title: {
            text: '이번주의 운동'
        },

        subtitle: { text: `${week_day_list[0]} ~ ${week_day_list[week_day_list.length-1]}` },
        
        xAxis: {
            categories: week_day_list,
        },

        yAxis: {
            title: {
                text: "횟수"
            },
        },

        legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'middle',
            width: "20%",
            itemStyle: {
                fontSize: "0.9rem",
            },
        },

        series: week_exercise_name_list.map((name) => {
            return {
                name: name,
                data: week_day_list.map((day) => week_log[day][name]),
            };
        }),
        responsive: {
            rules: [{
                condition: {
                    maxWidth: 420,
                },
                chartOptions: {
                    xAxis: {
                        labels: {
                            rotation: 290,
                        },
                    },
                    yAxis: {
                        title: {
                            text: null
                        },
                    },
                }
            }, {
                condition: {
                    minWidth: 421,
                    maxWidth: 730,
                },
                chartOptions: {
                    xAxis: {
                        labels: {
                            rotation: 315,
                        },
                    },
                    yAxis: {
                        title: {
                            text: null
                        },
                    },
                }
            }, {
                condition: {
                    minWidth: 731,
                },
                chartOptions: {
                    xAxis: {
                        labels: {
                            rotation: 315,
                        },
                    },
                }
            }],
        },
    });

    // 버튼으로 그래프
    let highcharts_container_elem = document.getElementsByClassName("highcharts-container")[0];
    let highcharts_today_elem = document.getElementById("highcharts-today");
    let highcharts_week_elem = document.getElementById("highcharts-week");
    let button_today_elem = document.getElementById("button-today");
    let button_week_elem = document.getElementById("button-week");

    button_today_elem.addEventListener("click", (event) => {
        if (button_week_elem.classList.contains("on")) {
            button_week_elem.classList.remove("on");
            highcharts_week_elem.classList.remove("on");
            button_today_elem.classList.add("on");
            highcharts_today_elem.classList.add("on");
        }
    });

    button_week_elem.addEventListener("click", (event) => {
        if (button_today_elem.classList.contains("on")) {
            button_today_elem.classList.remove("on");
            highcharts_today_elem.classList.remove("on");
            button_week_elem.classList.add("on");
            highcharts_week_elem.classList.add("on");
        }
    });

    // auto resizing event
    let chartResize = (chart) => {
        let padding = parseInt(window.getComputedStyle(highcharts_container_elem).padding);
        let new_width = parseInt(window.getComputedStyle(highcharts_container_elem).width);
        let new_height = parseInt(window.getComputedStyle(highcharts_container_elem).height);
        chart.setSize(new_width - 2*padding, new_height - 2*padding);
    }
    window.addEventListener("resize", (event) => {
        chartResize(highcharts_today);
        chartResize(highcharts_week);
    }),

    chartResize(highcharts_today);
    chartResize(highcharts_week);
}

window.onload = function() {
    loadHistory();
};
