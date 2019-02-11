import React, {Component} from 'react'
import ReactDOM from 'react-dom'
import {getLatestOdd} from '../static/js/common_help'
import ga from '../components/GAModule'

class OddComp extends Component {
    constructor(props) {
        super(props)

        this.state = {
            uncheckSeqNo: this.props.uncheckSeqNo,
            calcEvent: {}
        }
    }

    /**
     * 해외 배당률 Data에는 odd.status값이 존재하지 않기 때문에
     * 국내 배당률의 status 값으로 배당률 박스를 노란색으로 칠한다.
     * 20180613
     **/
    getLatestOddForColoring() {
        let latestOdd = {}
        this.props.oddsDomestic.forEach(function(odd) {
            if(odd.latest === true) {
                latestOdd = odd
            }
        })
        return latestOdd
    }

    // 취소된 경기일때 배당률에 취소선 긋기
    isCanceled(rate) {
        if(rate != "-") {
            if(this.props.eventStatus == "CANCEL") {
                return "lineThrough"
            } else {
                return ""
            }
        } else {
            return "-"
        }
    }

    // 화살표 Up/Down 구하기
    getOddChange(odd, oddType) {
        let oddChange = "";

        let getArrowType = (oddRate, oddDiffRate) => {

            //해외 배당률일때는 diff Rate 필드값이 없다
            if(oddDiffRate === undefined) return ""
            if(oddRate === "-" || oddDiffRate === "-") return ""
            if(oddRate == oddDiffRate) return ""

            if(oddRate > oddDiffRate) {
                oddChange = "arrowUp"
            } else {
                oddChange = "arrowDown"
            }

            return oddChange
        }

        switch(oddType) {
            case "oneRate":
                getArrowType(odd.oneRate, odd.diffOneRate)
                break;
            case "twoRate":
                getArrowType(odd.twoRate, odd.diffTwoRate)
                break;
            case "xRate":
                getArrowType(odd.xrate, odd.diffXRate)
                break;
            default:
                break;
        }

        return oddChange

    }

    // 배당률 텍스트 승무패 설정
    getOddText(odd) {
        let oddText = {}
        let isAbroad = this.props.isAbroad

        // 언오버 게임이라면
        if(odd.type === "UNOVER") {
            oddText = {
                one: "U",
                x:   "",
                two: "O"
            }
        } else { // 승무패, 핸디게임이라면
            if(isAbroad) { // 해외 배당률이라면
                oddText = {
                    one: "W",
                    x:   "D",
                    two: "L"
                }
            } else { // 국내 배당률이라면
                oddText = {
                    one: "승",
                    x:   "무",
                    two: "패"
                }
            }

        }
        return oddText
    }

    getOddBoxColor(latestOdd, boxSide) {

        let rateBoxSide = boxSide
        let oddStatus = latestOdd.status

        if(oddStatus == rateBoxSide) {
            return "oddTextSubContainer"
        } else {
            return ""
        }
    }

    chkIfNull(val) {
        if(val == "") {
            return "-"
        } else {
            return val
        }
    }

    isRateNotExist(latestOdd) {
        // 배당률이 나왔는데 배당률 값이 "-" 이라면 체크박스를 안보여준다.
        if(latestOdd.oneRate != "-" && latestOdd.xrate == "-") {
            return true
        }
    }

    // /**
    //  * Disable 체크 및 탭 변경시 체크박스 업데이트
    //  * */
    // getDisabledStatus(latestOdd) {
    //
    //     let gameStatus = this.props.eventStatus
    //     let rateValue = latestOdd.oneRate
    //
    //     if(gameStatus == "CANCEL" || rateValue == "-") {
    //         return "disabled"
    //     } else {
    //         return ""
    //     }
    // }

    controlChkBox(e, latestOdd, type) {

        /**
         * GA: "경기리스트"의 체크박스 클릭 수
         * */
        let gaLabel = "proto_click_checkBox"
        ga.ClickEvent(gaLabel)

        let event = this.props.event
        let calcEventList = this.props.calcEventList
        let shouldPauseProcess = false
        let gameStatus = this.props.eventStatus

        /**
         * 해외배당률을 클릭했다면 경고창후 return
         * */
        let isAbroad = this.props.isAbroad
        if(isAbroad) {
            e.target.checked = false
            return window.alert("국내배당률만 조합/계산 가능합니다. 국내배당률로 변경하여 이용바랍니다.")
        }

        /**
         * 중복게임 확인
         * */
        if(this.props.event.hasOwnProperty("gameMap") && this.props.event.gameMap != null) {
            let gameId = this.props.event.gameMap.gameId

            calcEventList.some(function(calcEvent, index) {
                if(calcEvent.gameMap != null) {
                    if(calcEvent.gameMap.gameId == gameId && calcEvent.seq != event.seq) {
                        window.alert("동일 경기 승무패/핸디캡/언더 오버 경기 조합은 불가능 합니다.")
                        shouldPauseProcess = true
                        return true
                    }
                }
            })
        }


        if (
            /**
             * 배당률 할당확인
             * */
            (type == "ONE" && latestOdd.oneRate == "-") ||
            (type == "X" && latestOdd.xrate == "-")     ||
            (type == "TWO" && latestOdd.twoRate == "-")) {
            window.alert("배당률이 등록된 이후 선택가능합니다.")
            shouldPauseProcess = true
        } else if(event.awayTeam == "미정" || event.homeTeam == "미정") {
            /**
             * 홈팀 & 원정팀 미정확인
             * */
            window.alert("해당 경기는 아직 홈/원정팀이 확정되지 않았습니다.")
            shouldPauseProcess = true
        }


        if(shouldPauseProcess) {
            e.target.checked = false
            return false
        }

        let isUnCheck = false
        let isSibling = false
        let eventSeq = this.props.event.seq
        let activeIndex = this.props.activeIndex

        let calcStatus = {
            seq : eventSeq,
            tabNo: activeIndex,
            userChkBox : e.target.id,
            noticeChkBox : latestOdd.status,
            isUnCheck : false,
            chkCorrection: false,
        }


        // 체크박스를 Radio 유형처럼 한 Element만 체크할 수 있게 처리
        let inputList = e.target.parentNode.parentNode.querySelectorAll("input")
        inputList.forEach(function(element, index) {
            if(e.target != element) {
                if(element.checked) {
                    element.checked = false
                    // element.disabled = ""
                    isSibling = true
                    element.nextSibling.classList.remove("noticeOddChkBox")
                    element.nextSibling.classList.remove("correctOddChkBox")
                    return
                }
            } else {
                // 체크를 해제시
                if(!element.checked) {
                    isUnCheck = true
                    calcStatus.isUnCheck = true
                }
            }
        })

        // 체크한 Event의 결과가 적중하지 않았을때와 실제 적중된 체크박스 CSS 변경
        if(latestOdd.status != "NONE") {
            if(e.target.id == latestOdd.status) {

                calcStatus.chkCorrection = true

                if(e.target.checked) {
                    e.target.nextSibling.classList.add('correctOddChkBox')
                } else {
                    e.target.nextSibling.classList.remove("correctOddChkBox")
                    e.target.nextSibling.classList.remove("noticeOddChkBox")
                }
            } else {
                calcStatus.chkCorrection = false
                inputList.forEach(function(element, index) {
                    if(element.id == latestOdd.status) {
                        if(e.target.checked && e.target != element) {
                            element.checked = true
                            // element.disabled = "disabled"
                            element.nextSibling.classList.add('noticeOddChkBox')
                            element.nextSibling.classList.remove("correctOddChkBox")
                        } else {
                            element.nextSibling.classList.remove("noticeOddChkBox")
                        }
                    }
                })
            }
        }

        /**
         * 기존 Event 데이터에 calcStatus 하위에
         * 1. chkCorrection 2. userChkBox 3. noticeChkBox
         * 세항목을 추가 후 index.js: doMediate 호출
         * */
        this.props.doMediate(event, isUnCheck, isSibling, calcStatus)
    }

    componentWillReceiveProps(nextProps) {
        /**
         * 계산기박스에서 목록 삭제 및 탭 변경시 프로토 리스트 체크박스 업데이트
         * */
        let uncheckSeqNo = nextProps.uncheckSeqNo
        let calcEvent = nextProps.calcEvent
        this.updateCalcEventList(uncheckSeqNo, calcEvent)
    }


    /**
     * 계산기박스에서 목록 삭제 및 탭 변경시 프로토 리스트 체크박스 업데이트
     * */
    updateCalcEventList(uncheckSeqNo, calcEvent) {

        let event = this.props.event
        let latestOdd = getLatestOdd(event.odds)
        let isCalcEventEmpty = Object.keys(calcEvent).length == 0 ? true : false
        let oddDivID = "odd_" + event.seq
        let oddDiv = ReactDOM.findDOMNode(this.refs[oddDivID])

        try {
            // 언체크번호일때 && 빈값일때 초기화
            if(event.seq == uncheckSeqNo || isCalcEventEmpty) {
                oddDiv.querySelectorAll("input").forEach(function(input, index) {
                    input.checked = false
                    // if(latestOdd.oneRate == "-") {
                    //     input.nextSibling.classList.add("disabled")
                    // } else {
                    //     input.nextSibling.classList.remove("disabled")
                    // }
                    input.nextSibling.classList.remove("noticeOddChkBox")
                    input.nextSibling.classList.remove("correctOddChkBox")
                })
            }
        } catch(e) {
            console.log(e)
        }

        if(!isCalcEventEmpty) {
            this.updateChkBox(event, calcEvent)
        }
    }


    updateChkBox(event, calcEvent) {

        let oddDivID = "odd_" + event.seq
        let oddDiv = ReactDOM.findDOMNode(this.refs[oddDivID])

        try {
            oddDiv.querySelectorAll("input").forEach(function(input, index) {
                input.checked = false
                input.nextSibling.classList.remove("noticeOddChkBox")
                input.nextSibling.classList.remove("correctOddChkBox")
            })
        } catch(e) {
            console.log(e)
        }

        let noticeChkBox = calcEvent.calcStatus.noticeChkBox
        let userChkBox = calcEvent.calcStatus.userChkBox
        let userInput = oddDiv.querySelector("input[id="+userChkBox+"]")
        let noticeInput = oddDiv.querySelector("input[id="+noticeChkBox+"]")

        if(calcEvent.calcStatus.hasOwnProperty("chkCorrection")) {

            if(calcEvent.calcStatus.chkCorrection) {
                if(userInput) {
                    try {
                        userInput.checked = true
                        userInput.nextSibling.classList.add("correctOddChkBox")
                    } catch(e) {
                        console.log(e)
                    }
                }
            } else {
                if(userInput) {
                    try{
                        userInput.checked = true
                    } catch(e) {
                        console.log(e)
                    }
                }

                if(noticeChkBox) {
                    if(noticeChkBox != "NONE") {
                        try {
                            noticeInput.checked = true
                            noticeInput.nextSibling.classList.add("noticeOddChkBox")
                            noticeInput.nextSibling.classList.remove("correctOddChkBox")
                        } catch (e) {
                            console.log(e)
                        }
                    }
                }
            }
        } else {
            if(userInput) {
                try {
                    userInput.checked = true
                } catch(e) {
                    console.log(e)
                }
            }
        }

    } // end updateChkBox


    hideIfAbroad() {
        let isAbroad = this.props.isAbroad

        if(isAbroad) {
            return "nonDisplay"
        } else {
            return ""
        }
    }

    componentDidMount() {
        // console.log("componentDidMount")
        /**
         * NAMED-9997
         * [PW] 프로토 > 배당률 입력 전 경기 비활성화 표시 안됨: 수정완료
         * */
        let event = this.props.event
        let latestOdd = getLatestOdd(event.odds)
        let oddDiv = document.getElementById("odd_" + event.seq)

        if(oddDiv) {
            try {
                oddDiv.querySelectorAll("input").forEach(function (input, index) {
                    if(latestOdd.oneRate == "-") {
                        input.nextSibling.classList.add("disabled")
                    }
                })
            } catch (e) {
                console.log(e)
            }
        }

        this.setState({
            calcEvent: this.props.calcEvent
        })
    }

    /**
     * 경기종목 변경시 || 페이지 로딩후 체크박스 업데이트
     * */
    componentDidUpdate() {

        let event = this.props.event
        let latestOdd = getLatestOdd(this.props.event.odds)
        let calcEvent = this.props.calcEvent
        let oddDiv = document.getElementById("odd_" + calcEvent.seq)
        let eventDiv = document.getElementById("odd_" + event.seq)

        /**
         * 20180706
         * 경기 상태가 경기전/경기중 -> 종료로 변경시
         * calcStatus를 다시 업데이트 후
         * tableComp에서[componentDidUpdate] 바뀐 상태값을 LocalStorage에 저장
         * */


        if(Object.keys(calcEvent).length > 0) {
            /**
             * 경기가 종료됐을때 lastest status를 parsing
             * */
            try {
                if(event.status == "DONE" && event.score != null) {
                    if(latestOdd.type === "WIN") {
                        if(parseInt(event.score.home) > parseInt(event.score.away)) {
                            latestOdd.status = "ONE"
                        } else if(parseInt(event.score.home) < parseInt(event.score.away)) {
                            latestOdd.status = "TWO"
                        } else {
                            latestOdd.status = "X"
                        }
                    } else if(latestOdd.type === "HANDICAP") {
                        if(event.score != null) {
                            if((parseInt(event.score.home) + parseFloat(latestOdd.options)) > parseInt(event.score.away)) {
                                latestOdd.status = "ONE"
                            } else if((parseInt(event.score.home) + parseFloat(latestOdd.options)) < parseInt(event.score.away)) {
                                latestOdd.status = "TWO"
                            } else if((parseInt(event.score.home) + parseFloat(latestOdd.options)) == parseInt(event.score.away)) {
                                latestOdd.status = "X"
                            }
                        }
                    } else { // UNOVER
                        if(event.sports == "VOLLEYBALL") {
                            if(event.score != null) {
                                if(event.score.hasOwnProperty("overAllHomeScore")) {
                                    event.score.home = event.score.overAllHomeScore
                                }
                                if(event.score.hasOwnProperty("overAllAwayScore")) {
                                    event.score.away = event.score.overAllAwayScore
                                }

                                if(parseFloat(latestOdd.options) > (parseInt(event.score.home) + parseInt(event.score.away))) {
                                    latestOdd.status = "ONE"
                                } else {
                                    latestOdd.status = "TWO"
                                }
                            }
                        }

                        if(event.score != null) {
                            if(parseFloat(latestOdd.options) > (parseInt(event.score.home) + parseInt(event.score.away))) {
                                latestOdd.status = "ONE"
                            } else {
                                latestOdd.status = "TWO"
                            }
                        }
                    }

                }
            } catch(e) {
                console.log(e, "oddComp")
            }

            if(latestOdd.status != "NONE") {
                if(latestOdd.status == calcEvent.calcStatus.userChkBox) {
                    calcEvent.calcStatus.chkCorrection = true
                    calcEvent.calcStatus.noticeChkBox = "NONE"
                    calcEvent.odds = event.odds
                } else {
                    calcEvent.calcStatus.chkCorrection = false
                    calcEvent.calcStatus.noticeChkBox = latestOdd.status
                    calcEvent.odds = event.odds
                }
            }

            this.props.calcMediate(calcEvent)
        }


        /**
         * NAMED-9997
         * [PW] 프로토 > 배당률 입력 전 경기 비활성화 표시 안됨
         * */
        if(eventDiv) {
            try {
                eventDiv.querySelectorAll("input").forEach(function(input, index) {
                    if(latestOdd.oneRate == "-") {
                        input.nextSibling.classList.add("disabled")
                    } else {
                        input.nextSibling.classList.remove("disabled")
                    }
                })
            } catch(e) {
                console.log(e)
            }
        }
 
        // if oddDiv != null
        if(oddDiv) {
            try {
                oddDiv.querySelectorAll("input").forEach(function(input, index) {
                    input.checked = false
                    input.nextSibling.classList.remove("noticeOddChkBox")
                    input.nextSibling.classList.remove("correctOddChkBox")
                })
            } catch(e) {
                console.log(e)
            }

            let noticeChkBox = calcEvent.calcStatus.noticeChkBox
            let userChkBox = calcEvent.calcStatus.userChkBox
            let userInput = oddDiv.querySelector("input[id="+userChkBox+"]")
            let noticeInput = oddDiv.querySelector("input[id="+noticeChkBox+"]")

            if(calcEvent.calcStatus.hasOwnProperty("chkCorrection")) {
                if(calcEvent.calcStatus.chkCorrection) {
                    if(userInput) {
                        try {
                            userInput.checked = true
                            userInput.nextSibling.classList.add("correctOddChkBox")
                        } catch(e) {
                            console.log(e)
                        }
                    }
                } else {
                    if(userInput) {
                        try{
                            userInput.checked = true
                        } catch(e) {
                            console.log(e)
                        }

                    }

                    if(noticeChkBox) {
                        if(noticeChkBox != "NONE") {
                            try {
                                noticeInput.checked = true
                                noticeInput.nextSibling.classList.add("noticeOddChkBox")
                                noticeInput.nextSibling.classList.remove("correctOddChkBox")
                            } catch (e) {
                                console.log(e)
                            }
                        }
                    }
                }
            } else {
                if(userInput) {
                    try {
                        userInput.checked = true
                    } catch(e) {
                        console.log(e)
                    }
                }
            }
        }
    }

    render() {

        const latestOdd = getLatestOdd(this.props.oddsArr)
        const oddText = this.getOddText(latestOdd)
        const lastestDomesticOdds = this.getLatestOddForColoring()

        return (
            <div>
                <div>
                    <div className="oddTextContainer">
                        <div className="oddText oddText-win">{oddText.one}</div>
                    </div>
                    <div className="oddTextContainer">
                        {
                            latestOdd.type ==="UNOVER" ?
                                <div className="oddText oddText-draw"><span>{oddText.x}</span></div> :
                                <div className="oddText oddText-draw">{oddText.x}</div>
                        }
                    </div>
                    <div className="oddTextContainer">
                        <div className="oddText oddText-lost">{oddText.two}</div>
                    </div>
                </div>

                <div>
                    <div className={"oddRateBox " + this.getOddBoxColor(lastestDomesticOdds, "ONE")} title="배당률">
                        <div className={this.isCanceled(latestOdd.oneRate)}>{this.chkIfNull(latestOdd.oneRate)}</div>
                        <div className="arrowContainer">
                            <div className={this.getOddChange(latestOdd, "oneRate")}>{}</div>
                        </div>
                    </div>

                    <div className={"oddRateBox " + this.getOddBoxColor(lastestDomesticOdds, "X")}  title="배당률">
                    {
                        latestOdd.xrate === "-" ?
                            <div>{latestOdd.xrate}</div> :
                            <div className={this.isCanceled(latestOdd.xrate)}>{this.chkIfNull(latestOdd.xrate)}</div>
                    }
                        <div className="arrowContainer">
                            <div className={this.getOddChange(latestOdd, "xRate")}>{}</div>
                        </div>
                    </div>

                    <div className={"oddRateBox " + this.getOddBoxColor(lastestDomesticOdds, "TWO")} title="배당률">
                        <div className={this.isCanceled(latestOdd.twoRate)}>{this.chkIfNull(latestOdd.twoRate)}</div>
                        <div className="arrowContainer">
                            <div className={this.getOddChange(latestOdd, "twoRate")}>{}</div>
                        </div>
                    </div>
                </div>

                <div className={"chkBoxContainer " + this.hideIfAbroad()} id={"odd_"+this.props.event.seq} ref={"odd_"+this.props.event.seq}>
                    <label className="container oneRate" id="ONE">
                        <input type        = "checkbox"
                               id          = "ONE"
                               value       = {latestOdd.oneRate}
                               // disabled    = {this.getDisabledStatus(latestOdd)}
                               onClick     = {(e) => this.controlChkBox(e, latestOdd, "ONE")} />

                        <span className={"oddCheckBox"}
                              ref={"oddSpan_"+this.props.event.seq}>{}</span>
                    </label>

                    <label className="container xRate" id="X">
                        {
                            this.isRateNotExist(latestOdd) ? "" :
                            <input type        = "checkbox"
                                   id          = "X"
                                   value       = {latestOdd.xrate}
                                   // disabled    = {this.getDisabledStatus(latestOdd)}
                                   onClick     = {(e) => this.controlChkBox(e, latestOdd, "X")} />
                        }

                        {
                            this.isRateNotExist(latestOdd) ? "" :
                                <span className={"oddCheckBox"}
                                      ref={"oddSpan_"+this.props.event.seq}>{}</span>
                        }
                    </label>

                    <label className="container twoRate" id="TWO">
                        <input type        = "checkbox"
                               id          = "TWO"
                               value       = {latestOdd.twoRate}
                               // disabled    = {this.getDisabledStatus(latestOdd)}
                               onClick     = {(e) => this.controlChkBox(e, latestOdd, "TWO")} />

                        <span className={"oddCheckBox"}
                              ref={"oddSpan_"+this.props.event.seq}>{}</span>
                    </label>
                </div>
            </div>
        )
    }
}

export default OddComp