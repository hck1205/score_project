// 야구 경기 웹푸시 데이터 가공
export const getUpdateBaseballEvents = (eventMessage, originEventsData) => {
    // console.log("baseball")

    let scoreDataArr = getSeriesArray(eventMessage)
    let updateEventsData = originEventsData
    let shouldUpdate = false

    scoreDataArr.forEach(function(scoreData, index) {
        scoreDataArr[index] = parseBaseballScoreData(scoreData)
        updateEventsData.forEach(function(event) {
            if(event.gameMap != null) {
                if(event.gameMap.hasOwnProperty("gameId")) {
                    if(event.gameMap.gameId == scoreDataArr[index].gameId) {
                        shouldUpdate = true
                        if(event.score == null) event.score = {}

                        event.score.home = scoreDataArr[index].homeScore
                        event.score.away = scoreDataArr[index].awayScore
                        event.status = scoreDataArr[index].status
                        event.gameStatus = scoreDataArr[index].gameStatus
                    }
                }
            }

        })
    })

    if(shouldUpdate) {
        return updateEventsData
    } else {
        return shouldUpdate
    }

}

// 축구 경기 웹푸시 데이터 가공
export const getUpdateSoccerEvents = (eventMessage, originEventsData) => {
    // console.log("football")

    let scoreDataArr = getSeriesArray(eventMessage)
    let updateEventsData = originEventsData
    let shouldUpdate = false

    scoreDataArr.forEach(function(scoreData, index) {

        scoreDataArr[index] = parseSoccerScoreData(scoreData)
        updateEventsData.forEach(function(event) {
            if(event.gameMap != null) {
                if(event.gameMap.hasOwnProperty("gameId")) {
                    if(event.gameMap.gameId == scoreDataArr[index].gameId) {
                        shouldUpdate = true
                        if(event.score == null) event.score = {}

                        event.score.home = scoreDataArr[index].homeScore
                        event.score.away = scoreDataArr[index].awayScore
                        event.status = scoreDataArr[index].status
                        event.gameStatus = scoreDataArr[index].gameStatus
                        event.gstatus = scoreDataArr[index].gstatus
                        event.startTime = scoreDataArr[index].startTime
                    }
                }
            }
        })
    })

    if(shouldUpdate) {
        return updateEventsData
    } else {
        return shouldUpdate
    }

}

// 배구 경기 웹푸시 데이터 가공
export const getUpdateVolleyballEvents = (eventMessage, originEventsData) => {
    // console.log("volleyBall")

    let scoreDataArr = getSeriesVolleyballArray(eventMessage)
    let updateEventsData = originEventsData
    let shouldUpdate = false

    scoreDataArr.forEach(function(scoreData, index) {

        updateEventsData.forEach(function(event) {
            if(event.gameMap != null) {
                if(event.gameMap.hasOwnProperty("gameId")) {
                    if(event.gameMap.gameId == scoreDataArr[index].gameId) {

                        shouldUpdate = true
                        if(event.score == null) event.score = {}

                        if(scoreDataArr[index].hasOwnProperty("currentHomeScore")) {
                            event.score.currentHomeScore = scoreDataArr[index].currentHomeScore
                        }

                        if(scoreDataArr[index].hasOwnProperty("currentAwayScore")) {
                            event.score.currentAwayScore = scoreDataArr[index].currentAwayScore
                        }

                        if(scoreDataArr[index].hasOwnProperty("overAllHomeScore")) {
                            event.score.overAllHomeScore = scoreDataArr[index].overAllHomeScore
                        }

                        if(scoreDataArr[index].hasOwnProperty("overAllAwayScore")) {
                            event.score.overAllAwayScore = scoreDataArr[index].overAllAwayScore
                        }

                        if(scoreDataArr[index].hasOwnProperty("status")) {
                            event.status = scoreDataArr[index].status
                        }

                        if(scoreDataArr[index].hasOwnProperty("gameQuota")) {
                            event.gameQuota = scoreDataArr[index].gameQuota
                        }

                        if(scoreDataArr[index].hasOwnProperty("quotaHomeScore")) {
                            event.score.home = scoreDataArr[index].quotaHomeScore
                        }

                        if(scoreDataArr[index].hasOwnProperty("quotaAwayScore")) {
                            event.score.away = scoreDataArr[index].quotaAwayScore
                        }
                    }
                }
            }

        })
    })

    if(shouldUpdate) {
        return updateEventsData
    } else {
        return shouldUpdate
    }

}

// 농구 경기 웹푸시 데이터 가공
export const getUpdateBasketballEvents = (eventMessage, originEventsData) => {
    // console.log("basketBall")

    let scoreDataArr = getSeriesBasketballArray(eventMessage)
    let updateEventsData = originEventsData
    let shouldUpdate = false

    scoreDataArr.forEach(function(scoreData, index) {
        updateEventsData.forEach(function(event) {
            if(event.gameMap != null) {
                if(event.gameMap.hasOwnProperty("gameId")) {
                    if(event.gameMap.gameId == scoreDataArr[index].gameId) {
                        shouldUpdate = true
                        if(event.score == null) event.score = {}

                        event.score.home = scoreDataArr[index].homeScore
                        event.score.away = scoreDataArr[index].awayScore
                        event.status = scoreDataArr[index].status
                        event.gameQuota = scoreDataArr[index].gameQuota
                        event.displayTime = scoreDataArr[index].displayTime
                    }
                }
            }

        })
    })

    if(shouldUpdate) {
        return updateEventsData
    } else {
        return shouldUpdate
    }

}

export const updateEventDataWithLiveScore = (originalEventsData, liveScoreData) => {

    /**
     * 20180512 by. Ckhong
     * gtype
     * 1 = 축구, 2 = 야구, 3 = 농구, 4 = 배구, 5 = 하키, 6 = 스타, 7 = NFL , 9 = lol,
     * 최초 페이지 로딩을 할때와 회차를 바꿀때
     **/

    let eventsData = originalEventsData
    let scoreData = liveScoreData
    let validSportsData = []


    // 야구, 농구, 배구, 축구만 취급한다.
    scoreData.forEach(function(score) {
        if (score.gtype == "1" ||
            score.gtype == "2" ||
            score.gtype == "3" ||
            score.gtype == "4")
        {
            validSportsData.push(score)
        }
    })

    validSportsData.forEach(function(score, scoreIndex) {
        eventsData.forEach(function(event, eventIndex) {
            if(event.status == "DONE") {return} // break statement : 프로토 정보를 우선시한다.
            if(event.gameMap != null) {
                if(event.gameMap.hasOwnProperty("gameId")) {
                    if(event.gameMap.gameId == score.gidx) {

                        if(event.score == null) event.score = {}

                        if(score.gtype == "1") // 1:축구
                        {
                            event.score.home = score.home_score
                            event.score.away = score.away_score
                            event.status = "PLAYING"

                            let gameStatus = getSoccerGameStatus(score.gstatus)
                            if(gameStatus.playStatus) { // 경기중라면
                                event.status = "PLAYING"
                                event.gameStatus = gameStatus.status
                            } else { // 경기전이라면
                                event.status = gameStatus.status
                                event.gameStatus = ""
                            }
                            event.gstatus = score.gstatus

                            let timeArr = score.sdate.split(',')
                            event.startTime = convertTimeFormat(timeArr)
                        }

                        if(score.gtype == "2") // 2:야구
                        {
                            if(score.home.score.score == "") {
                                event.score.home = 0
                            } else {
                                event.score.home = score.home.score.score
                            }

                            if(score.away.score.score == "") {
                                event.score.away = 0
                            } else {
                                event.score.away = score.away.score.score
                            }

                            event.status = getBaseballGameStatus(score.gstatus)
                            event.gameStatus = score.inning+"회"+score.inningState
                        }

                        if(score.gtype == "3") // 농구
                        {
                            event.score.home = score.h_score_sum
                            event.score.away = score.a_score_sum
                            event.status = getBasketballGameStatus(score.gstatus)
                            event.gameQuota = score.quota // 5:연장전, 0:경기중, 나머지외 숫자(쿼터)
                            event.displayTime = score.gtime
                        }

                        if(score.gtype == "4") // 배구
                        {
                            let homeScore = getVolleyballEachSetScore(score.quota, score, "home") // 홈 현재세트 점수
                            if(homeScore == "") {
                                event.score.currentHomeScore = 0
                            } else {
                                event.score.currentHomeScore = homeScore
                            }

                            let awayScore = getVolleyballEachSetScore(score.quota, score, "away")  // 어웨이 현재세트 점수
                            if(awayScore == "") {
                                event.score.currentAwayScore = 0
                            } else {
                                event.score.currentAwayScore = awayScore
                            }

                            event.score.overAllHomeScore = score.h_score_6 // 현재까의 총 세트점수
                            event.score.overAllAwayScore = score.a_score_6 // 현재까의 총 어웨이점수

                            event.status = getVolleyballGameStatus(score.gstatus) // 게임상태
                            event.gameQuota = score.quota           // 현재 세트
                            event.score.home = score.home_score     //세트 점수(홈)
                            event.score.away = score.away_score     //세트 점수(어웨이)
                        }
                    }
                } // end event.gameMap.hasOwnProperty("gameId")
            } // end event.gameMap != null

        })
    })

    return eventsData

}

// 웹푸쉬 데이터 Pasring(농구)
function getSeriesBasketballArray(messages) {

    let ar_series = []
    let tempMsgArr = []
    let tempMsg = JSON.parse(messages)

    if(Array.isArray(tempMsg)) {
        tempMsgArr = tempMsg
    } else {
        tempMsgArr.push(tempMsg)
    }

    tempMsgArr.forEach(function(msg) {

        let updateData = {}

        // Home Team Score
        let homeScore = 0
        msg.gameTeams[0].scores.forEach(function(quota) {
            homeScore += quota.score
        })
        updateData.homeScore = homeScore

        // Away Team Score
        let awayScore = 0
        msg.gameTeams[1].scores.forEach(function(quota) {
            awayScore += quota.score
        })
        updateData.awayScore = awayScore

        // 농구경기상태(READY:대기, PLAYING: 경기중, DONE:종료, CANCEL:취소)
        updateData.status = getBasketballGameStatus(msg.status)

        // n쿼터
        updateData.gameQuota = msg.period

        // 남은시간
        updateData.displayTime = msg.displayTime

        // gameId
        updateData.gameId = msg.id

        ar_series.push(updateData)
    })

    return ar_series
}


// 웹푸쉬 데이터 Pasring(배구)
// 배구 웹푸쉬 데이터는 바뀐 데이터 값만 내려온다...
function getSeriesVolleyballArray(messages) {

    let ar_series = [];

    let homeScoreKey = ['ba','bc','be','bg','bi'] // 1세트, 2세트, 3세트, 4세트, 5세트 점수
    let awayScoreKey = ['bb','bd','bf','bh','bj']

    JSON.parse(messages).forEach(function(msg) {

        let updateData = {}


        // 홈 점수찾기
        homeScoreKey.forEach(function(key) {
            if(key in msg) {
                updateData.currentHomeScore = msg[key]
            }
        })

        // 어웨이 점수찾기
        awayScoreKey.forEach(function(key) {
            if(key in msg) {
                updateData.currentAwayScore = msg[key]
            }
        })

        // 홈 세트 총점수 : UNOVER 점수
        if("da" in msg) {
            updateData.overAllHomeScore = msg["da"]
        }

        // 어웨이 세트 총점수 : UNOVER 점수
        if("db" in msg) {
            updateData.overAllAwayScore = msg["db"]
        }

        // 경기상태
        if("ab" in msg) {
            updateData.status = getVolleyballGameStatus(msg["ab"])
        }

        // 현재세트
        if("qt" in msg) {
            updateData.gameQuota = msg["qt"]
        }

        // 홈세트 스코어
        if("dc" in msg) {
            updateData.quotaHomeScore = msg["dc"]
        }

        // 어웨이세트 스코어
        if("dd" in msg) {
            updateData.quotaAwayScore = msg["dd"]
        }

        // gameId
        updateData.gameId = msg["aa"]

        ar_series.push(updateData)

    })

    return ar_series
}


// 웹푸쉬 데이터 Pasring(축구, 야구)
function getSeriesArray(msg) {
    let ar = msg.match(/LiveLog.*?;/g);
    let ar_series = [];

    for(let p in ar) {
        if(ar.hasOwnProperty(p)) {
            let gidx = ar[p].replace(/LiveLog\[/g, "").replace(/\].*/g,"");
            let replaced_data = ar[p].replace(/LiveLog\[.*?=/g, "").replace(/;var LogOrd.*/g, "");
            let ar_msg = eval(replaced_data);
            ar_msg.push(gidx);
            ar_series.push(ar_msg);
        }
    }

    return ar_series;
}

// 야구데이터 가공
function parseBaseballScoreData(scoreData) {

    let parseData = {}

    scoreData.forEach(function(subMessage, index) {

        if(index == 0) {
            let tempArr = subMessage.split(",")
            parseData.homeScore = tempArr[12]
        }

        if(index == 1) {
            let tempArr = subMessage.split(",")
            parseData.awayScore = tempArr[12]
        }

        if(index == 2) {
            parseData.status = getBaseballGameStatus(subMessage)
        }

        if(index == 4) {
            let tempArr = subMessage.split(",")
            parseData.gameStatus = tempArr[10] + "회" + tempArr[11]
        }

        if(index == 6) {
            parseData.gameId = subMessage
        }
    })

    return parseData;
}


// 축구데이터 가공
function parseSoccerScoreData (scoreData) {
    let parseData = {}

    scoreData.forEach(function(subMessage, index) {

        if(index == 0) {
            parseData.homeScore = subMessage
        }

        if(index == 1) {
            parseData.awayScore = subMessage
        }

        if(index == 2) {
            let gameStatus = getSoccerGameStatus(subMessage)

            if(gameStatus.playStatus) { // 경기중라면
                parseData.status = "PLAYING"
                parseData.gameStatus = gameStatus.status
            } else { // 경기전이라면
                parseData.status = gameStatus.status
                parseData.gameStatus = ""
            }
            parseData.gstatus = subMessage
        }

        if(index == 3) { // 경기 시작시간
            let timeArr = subMessage.split(',')
            if(timeArr.length > 1) {
                // IE Date.parse 이슈로 "mm/dd/yyyy hh:mm:ss" 와 같은 형태로 converting해주어야한다.
                parseData.startTime = convertTimeFormat(timeArr)
            } else {
                parseData.startTime = ""
            }
        }

        if(index == 6) {
            parseData.gameId = subMessage
        }
    })

    return parseData;
}

// 야구경기상태(1:대기, 2:경기중, 3:종료, 4:경기취소, 5:연기, 6:일시정지)
function getBaseballGameStatus(statusNum) {

    let status = parseInt(statusNum)
    let gameStatus = ""

    switch (status) {
        case 1:
            gameStatus = "READY"
            break;
        case 2:
            gameStatus = "PLAYING"
            break;
        case 3:
            gameStatus = "DONE"
            break;
        case 4:
            gameStatus = "CANCEL"
            break;
        case 5:
            gameStatus = "DELAY"
            break;
        case 6:
            gameStatus = "HOLD"
            break;
        default:
            break;

    }
    return gameStatus
}

// 축구경기상태(1:전반, 2:하프타임, 3:후반, 4,12:종료, 5:일시정지, 6,14,15:취소, 7,8,9,10:연장, 11,13:연기, 16:골든, 17:대기)
function getSoccerGameStatus(statusNum) {

    let gameStatus = {
        status: "",
        playStatus: false
    }

    if(statusNum == 1) {
        gameStatus.status = "전반전"
        gameStatus.playStatus = true
    } else if(statusNum == 2) {
        gameStatus.status = "HT"
        gameStatus.playStatus = true
    } else if(statusNum == 3) {
        gameStatus.status = "후반전"
        gameStatus.playStatus = true
    } else if(statusNum == 4 || statusNum == 12) {
        gameStatus.status = "DONE"
    } else if(statusNum == 5) {
        gameStatus.status = "HOLD"
    } else if(statusNum == 6 || statusNum == 14 || statusNum == 15) {
        gameStatus.status = "CANCEL"
    } else if(statusNum == 7 || statusNum == 8 || statusNum == 9 || statusNum == 10) {
        gameStatus.status = "연장전"
        gameStatus.playStatus = true
    } else if(statusNum == 11 || statusNum == 13) {
        gameStatus.status = "DELAY"
    } else if(statusNum == 16) {
        gameStatus.status = "골든게임"
        gameStatus.playStatus = true
    } else { // statusNum == 17
        gameStatus.status = "READY"
    }

    return gameStatus
}

// 배구경기상태(1:대기, 2:경기중, 3:종료, 4:취소)
function getVolleyballGameStatus(statusNum) {

    let status = parseInt(statusNum)
    let gameStatus = ""

    switch (status) {
        case 1:
            gameStatus = "READY"
            break;
        case 2:
            gameStatus = "PLAYING"
            break;
        case 3:
            gameStatus = "DONE"
            break;
        case 4:
            gameStatus = "CANCEL"
            break;
        default:
            break;

    }

    return gameStatus
}


// 농구경기상태(READY:대기, IN_PROGRESS: 경기중, FINAL:종료, CANCEL:취소)
function getBasketballGameStatus(status) {

    let gameStatus = ""

    // Live Score
    if(status == "1") {
        gameStatus = "READY"
    }

    if(status == "2") {
        gameStatus = "PLAYING"
    }

    if(status == "3") {
        gameStatus = "DONE"
    }
    // End Live Score

    // web push server
    if(status == "IN_PROGRESS") {
        gameStatus = "PLAYING"
    }

    if(status == "FINAL") {
        gameStatus = "DONE"
    }

    if(status == "CANCEL") {
        gameStatus = "CANCEL"
    }

    if(status == "READY") {
        gameStatus = "READY"
    }

    return gameStatus
}

// 배구 현재 세트별 점수 구하기
function getVolleyballEachSetScore(quota, score, team) {
    let homeScore = [score.h_score_1, score.h_score_2, score.h_score_3, score.h_score_4, score.h_score_5]
    let awayScore = [score.a_score_1, score.a_score_2, score.a_score_3, score.a_score_4, score.a_score_5]

    if(team == "home") {
        return homeScore[quota-1]
    } else {
        return awayScore[quota-1]
    }
}

function convertTimeFormat(timeArr) {
    // IE Date.parse 이슈로 "mm/dd/yyyy hh:mm:ss" 와 같은 형태로 converting해주어야한다.
    return timeArr[1]+"/"+timeArr[2]+"/"+timeArr[0]+" "+timeArr[3]+":"+timeArr[4]+":"+timeArr[5]
}