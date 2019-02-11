import {
    getLatestOdd,
    roundUp,
    roundDown,
} from "./common_help";

export const getCalcEventTypeColor = (event) => {
    let eventType = getLatestOdd(event.odds).type

    if (eventType == "WIN") return "calcWin"
    if (eventType == "UNOVER") return "calcUnover"
    if (eventType == "HANDICAP") return "calcHandicap"

    return ""
}

export const getOptionVal = event => {

    let latestOdd = getLatestOdd(event.odds)
    let optionValue = parseFloat(latestOdd.options).toFixed(1)
    let prefix = ""


    if(latestOdd.type == "UNOVER") {
        prefix = "U"
    } else if(latestOdd.type == "HANDICAP") {
        prefix = "H"
    }

    if(latestOdd.type == "WIN") {
        return ""
    }

    return "(" + prefix + optionValue + ")"
}

export const getOptionType = (event) => {
    let latestOdd = getLatestOdd(event.odds)

    if(latestOdd.type == "HANDICAP") return "handicap"
    if(latestOdd.type == "UNOVER") return "unover"

    return ""
}

export const getCalcOddText = (event, oddNo) => {

    let latestOdd = getLatestOdd(event.odds)

    if(event.hasOwnProperty("calcStatus")) {
        if (event.calcStatus.userChkBox == oddNo.toUpperCase() ||
            event.calcStatus.noticeChkBox == oddNo.toUpperCase()) {
            if(latestOdd.type != "UNOVER") {
                if(oddNo == "one") return "승"
                if(oddNo == "x")   return "무"
                if(oddNo == "two") return "패"
            } else {
                if(oddNo == "one") return "U"
                if(oddNo == "two") return "O"
            }
        }
    }

    return ""
}

export const getCalcOddTextColor = (event, oddNo) => {
    if(event.hasOwnProperty("calcStatus")) {
        if(event.calcStatus.hasOwnProperty("chkCorrection")) {
            if(event.calcStatus.chkCorrection && event.calcStatus.userChkBox == oddNo.toUpperCase()) {
                return "correct"
            }
        }
    }

    return ""
}

export const isUserChkBox = (event, oddNo) => {
    if(event.hasOwnProperty("calcStatus")) {
        if(event.calcStatus.isUnCheck) {
            if(event.calcStatus.userChkBox == oddNo.toUpperCase()) {
                return true
            }
            if(event.calcStatus.noticeChkBox == oddNo.toUpperCase()) {
                return false
            }
        }

        if(event.calcStatus.userChkBox == oddNo.toUpperCase()) {
            return true
        } else if(event.calcStatus.noticeChkBox == oddNo.toUpperCase()) {
            return true
        }
    }
    return false
}

export const getNonDisplayChkBox = (event, oddNo) => {
    if(event.hasOwnProperty("calcStatus")) {
        if(event.calcStatus.isUnCheck) {
            if(event.calcStatus.userChkBox == oddNo.toUpperCase()) {
                return ""
            }
            if(event.calcStatus.noticeChkBox == oddNo.toUpperCase()) {
                return "nonDisplay"
            }
        }

        if (event.calcStatus.userChkBox != oddNo.toUpperCase() &&
            event.calcStatus.noticeChkBox != oddNo.toUpperCase()) {
            return "nonDisplay"
        }
    }
}

export const isChecked = (event, oddNo) => {

    if(event.calcStatus.isUnCheck) return false

    if(event.hasOwnProperty("calcStatus")) {
        if(event.calcStatus.userChkBox == oddNo.toUpperCase()) {
            return true
        } else if(event.calcStatus.noticeChkBox == oddNo.toUpperCase()) {
            return true
        }
    }
    return false
}

export const getCalcChkBoxColor = (event, oddNo) => {
    if(event.hasOwnProperty("calcStatus")) {
        if(event.calcStatus.isUnCheck) return ""

        if(!event.calcStatus.chkCorrection && event.calcStatus.noticeChkBox == "NONE") {
            return ""
        } else {
            if(event.calcStatus.chkCorrection && event.calcStatus.userChkBox == oddNo.toUpperCase()) {
                return "correctOddChkBox"
            }
            if(!event.calcStatus.chkCorrection && event.calcStatus.noticeChkBox == oddNo.toUpperCase()) {
                return "noticeOddChkBox"
            }
        }
    }
    return ""
}

export const getEstimateOddRate = (calcEventList, type) => {
    let totalOddRate = 1

    if(calcEventList.length == 0) return 0

    calcEventList.map(function(event, index) {
        let userChkOddRate = 0

        if(event.calcStatus.userChkBox == "ONE") userChkOddRate = parseFloat(getLatestOdd(event.odds).oneRate)
        if(event.calcStatus.userChkBox == "X")   userChkOddRate = parseFloat(getLatestOdd(event.odds).xrate)
        if(event.calcStatus.userChkBox == "TWO") userChkOddRate = parseFloat(getLatestOdd(event.odds).twoRate)

        totalOddRate = totalOddRate * userChkOddRate
    })

    totalOddRate = roundDown(totalOddRate,2) // 소수 둘째자리까지 버림 ex) 4.34536 -> 4.34

    if(type == "multiple") {
        return roundUp(totalOddRate.toFixed(2), 1) // 소수 첫째자리까지 올림 ex) 4.34-> 4.4
    } else if(type == "percentage") {
        let percentage = (roundUp(totalOddRate.toFixed(2), 1) * 100) - 100
        return percentage.toFixed(0)
    }

    return totalOddRate
}

export const inspectBetAmt = (e) => {

    let isValid = true
    let value = e.target.value
    value = value.replace(/[^\d]/,'')

    if(parseInt(value) > 100000) {
        // window.alert('공식베팅 금액은 최대 10만원 입니다.')
        e.target.value = "100000".replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        isValid = false
    } else {
        value = value.toString().replace(/[^\d]/,'')
        e.target.value = value.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    let valueArr = value.split('')

    if(valueArr[0] == 0) {
        if(valueArr.length > 1) {
            e.target.value = valueArr[1]
        }
    }

    return isValid
}

export const getActiveTabIndex = (calcSetList) => {
    let activeIndex = 0

    calcSetList.some(function(calcSet, index) {
        if(calcSet.isActive == "active") {
            activeIndex = index
            return true
        }
    })

    return activeIndex
}

export const getActiveCalSet = (calcSetList) => {
    let activeIndex = 0

    calcSetList.some(function(calcSet, index) {
        if(calcSet.isActive == "active") {
            activeIndex = index
            return true
        }
    })

    return calcSetList[activeIndex]
}

export const getUpdatedEvent = (event, calcStatus) => {
    let updatedEvent = {}

    updatedEvent.id         = event.id
    updatedEvent.seq        = event.seq
    updatedEvent.startAt    = event.startAt
    updatedEvent.odds       = event.odds
    updatedEvent.league     = event.league
    updatedEvent.awayTeam   = event.awayTeam
    updatedEvent.homeTeam   = event.homeTeam
    updatedEvent.calcStatus = calcStatus
    updatedEvent.gameMap    = event.gameMap

    return updatedEvent
}

export const changeCalcEventList = (currentCalcEventList, updatedEvent, isUnCheck) => {

    // UnCheck라면 리스트에서 제외
    if(isUnCheck) {
        currentCalcEventList.forEach(function(calcEvent, index) {
            if(calcEvent.seq == updatedEvent.seq) {
                currentCalcEventList.splice(index, 1)
            }
        })
    } else {
        let isDupData = false
        // 현재 계산기 리스트가 비어있다면 그냥 Push
        if(currentCalcEventList.length == 0) {
            currentCalcEventList.push(updatedEvent)
        } else {
            // 중복된 리스트가 있는지 확인 후 Replace
            currentCalcEventList.some(function(calcEvent, index) {
                if(calcEvent.seq == updatedEvent.seq) {
                    currentCalcEventList[index] = updatedEvent
                    isDupData = true
                    return true
                }
            })
            // 중복된 리스트가 없다면 Push
            if(!isDupData) {
                currentCalcEventList.push(updatedEvent)
            }
        }
    }


    // 정렬
    currentCalcEventList.sort(function (a, b) {
        if (a.seq > b.seq) {
            return 1;
        }
        if (a.seq < b.seq) {
            return -1;
        }
        // a must be equal to b
        return 0;
    });

    return currentCalcEventList
}


export const getStickyifiFrame = () => {
    if(window.parent == self) { // 부모창이 없을때
        return "sticky"
    } else {
        return ""
    }
}

export const addClassifiFrame = () => {
    if(window.parent == self) { // 부모창이 없을때
        return ""
    } else { // 부모창이 있을때
        return "iFrameMode "
    }
}