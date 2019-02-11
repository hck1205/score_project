import getConfig from 'next/config'
const {publicRuntimeConfig} = getConfig()

// 게임 타입
export const getNameOfEventType = (gameType) => {
    let type

    switch (gameType) {
        case "WIN":
            type = "일반"
            break;
        case "HANDICAP":
            type = "핸디캡"
            break;
        case "UNOVER":
            type = "언더오버"
            break;
        default:
            type = "";
            break;
    }

    return type
}

// 게임 이미지
export const getGameImage = (sportsType) => {

    let imgTag

    switch (sportsType) {
        case "SOCCER":
            imgTag = <img src={`${publicRuntimeConfig.SUB_NAME}/static/img/game_football.png`}/>
            break;
        case "BASEBALL":
            imgTag = <img src={`${publicRuntimeConfig.SUB_NAME}/static/img/game_baseball.png`}/>
            break;
        case "BASKETBALL":
            imgTag = <img src={`${publicRuntimeConfig.SUB_NAME}/static/img/game_basketball.png`}/>
            break;
        case "VOLLEYBALL":
            imgTag = <img src={`${publicRuntimeConfig.SUB_NAME}/static/img/game_volleyball.png`}/>
            break;
        default:
            imgTag = ""
            break;
    }

    return imgTag
}


export const getGameResult = (event) => {

    // 경기중일때 상태 표기
    if(event.sports == "BASKETBALL" && event.status == "PLAYING") {

        if(event.gameQuota == "") { return "준비중"}

        if(event.gameQuota == 5) {
            return "연장전"
        } else if(event.gameQuota == 0) {
            return "경기중"
        } else {
            return event.gameQuota+"쿼터"
        }
    }

    if(event.sports == "VOLLEYBALL" && event.status == "PLAYING") {
        return event.gameQuota+"세트"
    }

    if(event.sports == "SOCCER" && event.status == "PLAYING") {
        return event.gameStatus
    }

    if(event.sports == "BASEBALL" && event.status == "PLAYING") {
        return event.gameStatus
    }

    // 경기중이 아닐때 상태 표기 (또는 경기중일때..)
    // 가장 최신의 배당률 정보를 획득
    let latestOdd = getLatestOdd(event)

    if(event.status === "DONE") {
        if(latestOdd.type === "WIN") { // 승무패
            if(event.score != null) {
                if(parseInt(event.score.home) > parseInt(event.score.away)) {
                    return "홈승"
                } else if(parseInt(event.score.home) < parseInt(event.score.away)) {
                    return "홈패"
                } else {
                    return "무승부"
                }
            } else {
                return "무승부" // or return ""
            }
        } else if(latestOdd.type === "HANDICAP") { // 핸디캡
            if(event.score != null) {
                if((parseInt(event.score.home) + parseFloat(latestOdd.options)) > parseInt(event.score.away)) {
                    return "핸디승"
                } else if((parseInt(event.score.home) + parseFloat(latestOdd.options)) < parseInt(event.score.away)) {
                    return "핸디패"
                } else if((parseInt(event.score.home) + parseFloat(latestOdd.options)) == parseInt(event.score.away)) {
                    return "핸디무"
                }
            } else {
                return ""
            }
        } else { // == "UNOVER"
            if(event.sports == "VOLLEYBALL") {
                if(event.score != null) {

                    if(event.score.hasOwnProperty("overAllHomeScore")) {
                        event.score.home = event.score.overAllHomeScore
                    }

                    if(event.score.hasOwnProperty("overAllAwayScore")) {
                        event.score.away = event.score.overAllAwayScore
                    }

                    if(parseFloat(latestOdd.options) > (parseInt(event.score.home) + parseInt(event.score.away))) {
                        return "언더"
                    } else {
                        return "오버"
                    }
                } else {
                    return ""
                }
            }

            if(event.score != null) {
                if(parseFloat(latestOdd.options) > (parseInt(event.score.home) + parseInt(event.score.away))) {
                    return "언더"
                } else {
                    return "오버"
                }
            } else {
                return ""
            }
        }
    } else if(event.status === "READY") {
        return "vs"
    } else if(event.status === "PLAYING") {
        return "경기중"
    } else if(event.status === "CANCEL") {
        return "취소"
    } else if(event.status === "DELAY") {
        return "지연"
    } else { // HOLD 이면
        return "중단"
    }
}

export const getResultColor = (result) => {
    if(result == "언더" ||
        result == "홈승" ||
        result == "핸디승") {
        return "gameResult-red"
    }

    if(result == "오버" ||
        result == "홈패" ||
        result == "핸디패") {
        return "gameResult-blue"
    }

    if(result == "무승부" ||
        result == "핸디무") {
        return "gameResult-gray"
    }

    if(result == "vs" ||
        result == "지연") {
        return "gameResult-green"
    }

    if(result == "취소") {
        return "gameResult-whiteGray"
    }

    // 경기중 또는 중단이라면
    return "gameResult-purple"
}

export const getHomeScore = (event) => {

    let latestOdd = getLatestOdd(event)
    let homeScore = 0;

    // 핸디캡 반영된 홈스코어 점수구하기
    let getHandiCapScore = (latestOdd) => {
        // IE PollyFill
        if(!Math.sign) {
            Math.sign = function(x) {
                return ((x > 0) - (x < 0)) || + x;
            }
        }

        let sign = Math.sign(latestOdd.options)
        let convertedOption = Math.abs(latestOdd.options) * sign

        return parseFloat(event.score.home) + parseFloat(convertedOption)
    }

    // 점수 예외 처리
    if(event.score == undefined) return "-"
    if(event.score.home == null || event.score.home == undefined) return "-"
    if(event.status == "READY") {
        if(event.score.home == 0) {
            return "-"
        } else {
            return event.score.home // "-"
        }
    }
    if(event.status == "CANCEL") {
        return "-"
    }

    //배구 경기라면 세트 점수 또는 현세트까지의 총 합계점수
    if(event.sports == "VOLLEYBALL") {
        homeScore = getVolleyballScore(event, "home")
    } else { // 그 외 종목이라면
        if(latestOdd.type == "HANDICAP") {
            homeScore = getHandiCapScore(latestOdd)
        } else {
            homeScore = event.score.home
        }
    }

    return homeScore
}

export const getAwayScore = (event) => {

    let awayScore = 0;

    // 예외처리
    if(event.score == null) return "-"
    if(event.score.away == null || event.score.away == undefined) return "-"
    if(event.status == "READY") {
        if(event.score.away == 0) return "-"
        return event.score.away // "-"
    }
    // 경기가 취소라면
    if(event.status == "CANCEL") {
        return "-"
    }

    //배구 경기라면 세트 점수 또는 현세트까지의 총 합계점수
    if(event.sports == "VOLLEYBALL") {
        awayScore = getVolleyballScore(event, "away")
    } else { // 그 외 종목이라면
        awayScore = event.score.away
    }

    return awayScore
}

export const getScoreColor = (event, team) => {

    let side = team
    let latestOdd = getLatestOdd(event)

    // 메시지 예외처리
    if(event.score == null) {return ""}
    if(event.score.home == null || event.score.away == null) {return ""}
    if(event.status == "READY") return ""


    // 배구종목일때
    if(event.sports == "VOLLEYBALL" && latestOdd.type == "UNOVER") {
        if(event.status == "PLAYING") {
            if(side == "home") {
                if(parseInt(event.score.overAllHomeScore) > parseInt(event.score.overAllAwayScore)) {
                    return "winningScore"
                } else if(parseInt(event.score.overAllHomeScore) < parseInt(event.score.overAllAwayScore)) {
                    return "losingScore"
                } else {
                    return "sameScore"
                }
            }
            if(side == "away") {
                if(parseInt(event.score.overAllHomeScore) > parseInt(event.score.overAllAwayScore)) {
                    return "losingScore"
                } else if(parseInt(event.score.overAllHomeScore) < parseInt(event.score.overAllAwayScore)) {
                    return "winningScore"
                } else {
                    return "sameScore"
                }
            }
        }
    }

    if(latestOdd.type == "HANDICAP") {
        if(event.status == "PLAYING") {
            if(side == "home") {
                if(parseFloat(event.score.home) + parseFloat(latestOdd.options) > event.score.away) {
                    return "winningScore"
                } else if (parseFloat(event.score.home) + parseFloat(latestOdd.options) < event.score.away) {
                    return "losingScore"
                } else {
                    return "sameScore"
                }
            } else {
                if(parseFloat(event.score.home) + parseFloat(latestOdd.options) > event.score.away) {
                    return "losingScore"
                } else if (parseFloat(event.score.home) + parseFloat(latestOdd.options) < event.score.away) {
                    return "winningScore"
                } else { // 동점일때
                    return "sameScore"
                }
            }
        } else { // DONE 일때
            if(side == "home") {
                if(parseFloat(event.score.home) + parseFloat(latestOdd.options) > event.score.away) {
                    return "wonScore"
                } else if (parseFloat(event.score.home) + parseFloat(latestOdd.options) < event.score.away) {
                    return "lostScore"
                } else { // 동점일때
                    return "sameScore"
                }
            } else {
                if(parseFloat(event.score.home) + parseFloat(latestOdd.options) > event.score.away) {
                    return "lostScore"
                } else if (parseFloat(event.score.home) + parseFloat(latestOdd.options) < event.score.away) {
                    return "wonScore"
                } else { // 동점일때
                    return "sameScore"
                }
            }
        }
    } else {
        if(event.status == "PLAYING") {
            if(side == "home") {
                if(parseInt(event.score.home) > parseInt(event.score.away)) {
                    return "winningScore"
                } else if (parseInt(event.score.home) < parseInt(event.score.away)) {
                    return "losingScore"
                } else { // 동점일때
                    return "sameScore"
                }
            } else {
                if(parseInt(event.score.home) > parseInt(event.score.away)) {
                    return "losingScore"
                } else if (parseInt(event.score.home) < parseInt(event.score.away)) {
                    return "winningScore"
                } else { // 동점일때
                    return "sameScore"
                }
            }
        } else { // DONE 일때
            if(side == "home") {
                if(parseInt(event.score.home) > parseInt(event.score.away)) {
                    return "wonScore"
                } else if (parseInt(event.score.home) < parseInt(event.score.away)) {
                    return "lostScore"
                } else { // 동점일때
                    return "sameScore"
                }
            } else {
                if(parseInt(event.score.home) > parseInt(event.score.away)) {
                    return "lostScore"
                } else if (parseInt(event.score.home) < parseInt(event.score.away)) {
                    return "wonScore"
                } else { // 동점일때
                    return "sameScore"
                }
            }
        }
    }
}

function getLatestOdd(event) {

    let latestOdd = {}
    event.odds.forEach(function(odd) {
        if(odd.latest === true) {
            latestOdd = odd
        }
    })

    return latestOdd
}

function getVolleyballScore(event, side) {

    let latestOdd = getLatestOdd(event)
    let score = 0

    if(side == "home") {
        if(latestOdd.type == "UNOVER") { // 언오버일때는 현재까지 세트 스코어의 총점
            if(event.score.hasOwnProperty("overAllHomeScore")) {
                score = event.score.overAllHomeScore ? event.score.overAllHomeScore : 0
            } else {
                score = event.score.home ? event.score.home : 0
            }
        } else if(latestOdd.type == "HANDICAP") { // 언오버가 아닐때는 세트 점수를 리턴
            // IE PollyFill
            if(!Math.sign) {
                Math.sign = function(x) {
                    return ((x > 0) - (x < 0)) || + x;
                }
            }
            let sign = Math.sign(latestOdd.options)
            let convertedOption = Math.abs(latestOdd.options) * sign

            score = parseFloat(event.score.home) + parseFloat(convertedOption)
        } else {
            score = event.score.home
        }
    } else {
        // 어웨이
        if(latestOdd.type == "UNOVER") {
            if(event.score.hasOwnProperty("overAllAwayScore")) {
                score = event.score.overAllAwayScore ? event.score.overAllAwayScore : 0
            } else {
                score = event.score.away ? event.score.away : 0
            }
        } else {
            score = event.score.away
        }
    }

    return score
}