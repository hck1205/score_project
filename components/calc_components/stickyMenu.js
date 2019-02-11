import {Component} from 'react'
import ReactDOM from 'react-dom'
import getConfig from "next/config"
import {getNameOfEventType} from '../../static/js/event_help'
import ga from '../../components/GAModule'
import {
    isIE,
    isSafari,
    isSamsung,
    getFormatDate,
    getLatestOdd,
    roundDown,
    getLocalStorage,
    updateLocalStorage,
    getNumOnly,
    getAmtLocale
}  from '../../static/js/common_help'
import {
    getCalcEventTypeColor,
    getOptionVal,
    getOptionType,
    getCalcOddText,
    getCalcOddTextColor,
    isUserChkBox,
    isChecked,
    getNonDisplayChkBox,
    getCalcChkBoxColor,
    getEstimateOddRate,
    inspectBetAmt,
    getActiveTabIndex,
    getActiveCalSet,
    getUpdatedEvent,
    changeCalcEventList,
    getStickyifiFrame,
    addClassifiFrame
} from '../../static/js/stickymenu_help'

const {publicRuntimeConfig} = getConfig()

const pageHeaderHeight = publicRuntimeConfig.PAGE_HEADER_HEIGHT
const singleRowHeight = publicRuntimeConfig.TABLE_ROW_HEIGHT
const pageFooterHeight = publicRuntimeConfig.PAGE_FOOTER_HEIGHT
const maxBetAmt = 100000000

class StickyMenu extends Component {
    constructor(props)  {
        super(props)

        this.state = {
            currentCalcEventList: this.props.calcEventList,
            calcSetList:[], // {calcSetEventList: [], tabName: "", isActive: "", betAmount: "", estimatePrice: ""}
            lastSetNo: 1,
            isMenuOpen: false,                         // PostMessage
        }
    }

    openCalcBox() {
        /**
         * GA 계산기 '닫힌' 상태의 조합추가 버튼 클릭 수
         * */
        let gaLabel = "proto_add_calcSet_status_close"
        ga.ClickEvent(gaLabel)

        let calcMenu = ReactDOM.findDOMNode(this.refs.calcMenu)
        calcMenu.classList.add("calcMenuHide")

        let maxYScroll = document.documentElement.scrollHeight - document.documentElement.clientHeight
        let currYScroll = document.documentElement.scrollTop
        let calcExpandMenu = ReactDOM.findDOMNode(this.refs.calcExpandMenu)
        calcExpandMenu.classList.remove("calcMenuHide")

        if(window.parent == self) {// 부모창이 없을때
            if(maxYScroll > currYScroll) {
                calcExpandMenu.className = "calcExpandMenuContainer sticky"
                // calcExpandMenu.className = "calcExpandMenuContainer"
            } else {
                calcExpandMenu.className = "calcExpandMenuContainer"
            }
        }

        /**
         * StickyMenu 열었을때 박스의 크기만큼 위로 이동
         * 20180711
         * */
        if(!this.state.isMenuOpen) {
            let calcContainer = document.getElementById("calcContainer")
            let topValue = calcContainer.style.top

            topValue = topValue.replace("px", "")
            calcContainer.style.top = (topValue - 300) + "px"
        }

        // 부모 iFrame resize
        this.iFrameResize("open")

        this.setState({
            isMenuOpen: true
        })
    }

    setCalcList(event, isUnCheck, isSibling, calcStatus) {

        let currentCalcEventList = this.state.currentCalcEventList // 현재 탭에 나타나느 계산기 리스트
        let lastSetNo = this.state.lastSetNo                       // 탭 이름 변경을 위한 No
        let calcSetList = this.state.calcSetList                   // 계산기 TAP 세트 리스트
        let activeCalSet = getActiveCalSet(calcSetList)            // 활성화 중인 탭의 CalcSet
        let activeIndex = getActiveTabIndex(calcSetList)           // 활성화 중인 탭 index
        let updatedEvent = getUpdatedEvent(event, calcStatus)      // calcStatus 를 포함한 event 정보 업데이트
        let roundCode = this.props.roundCode                       // 라운드번호 ex)180054

        if(currentCalcEventList.length >= 10 && !isUnCheck && !isSibling) {
            window.alert("10개까지만 선택가능합니다.")
            this.props.removeCalcCheckList(event.seq)
        } else {
            // currentCalcEventList 업데이트
            currentCalcEventList = changeCalcEventList(currentCalcEventList, updatedEvent, isUnCheck)

            //index.js this.setState({})
            this.props.updateTableCheckList(currentCalcEventList, activeIndex)

            // 예상 적중금 금액 변경
            let estimatePriceElement = ReactDOM.findDOMNode(this.refs.estimatePrice)
            let betAmount = getNumOnly(ReactDOM.findDOMNode(this.refs.betAmount).value)
            let oddRate = getEstimateOddRate(currentCalcEventList, "multiple")
            let estimatePrice = parseInt(betAmount) * parseFloat(oddRate)

          // if(betAmount == "") betAmount = 0

            if(isNaN(estimatePrice)) {
                estimatePrice = 0
                estimatePriceElement.value = estimatePrice
            } else {
                if(roundDown(estimatePrice, 0) > maxBetAmt) {
                    window.alert("공식베팅은 적중금액을 1억원을 넘을 수 없습니다.")
                    estimatePrice = maxBetAmt
                    estimatePriceElement.value = getAmtLocale(estimatePrice)
                } else {
                    estimatePrice = roundDown(estimatePrice, 0)
                    estimatePriceElement.value = getAmtLocale(estimatePrice)
                }
            }

            // 탭이 없다면
            if(calcSetList.length == 0) {
                let newTabInfo = {
                    calcSetEventList: [updatedEvent],
                    tabName: lastSetNo + "조합",
                    isActive: "active",
                }
                calcSetList.push(newTabInfo)
                lastSetNo += 1
            } else {
                activeCalSet.calcSetEventList = currentCalcEventList
                activeCalSet.betAmount = betAmount
                activeCalSet.estimatePrice = estimatePrice
            }

            // LocalStorage data
            let calcLocalStorageData = {
                currentCalcEventList: currentCalcEventList,
                calcSetList: calcSetList,
                lastSetNo: lastSetNo,
            }

            updateLocalStorage(roundCode, calcLocalStorageData)

            this.setState({
                currentCalcEventList: currentCalcEventList,
                calcSetList: calcSetList,
                lastSetNo: lastSetNo,
            })
        }
    }

    updateCalcTableCheckStatus(calcEvent) {
        let currentCalcEventList = this.state.currentCalcEventList

        currentCalcEventList.some(function(event, index) {
            if(event.seq == calcEvent.seq) {
                currentCalcEventList[index] = calcEvent
                return true
            }
        })

        this.setState({
            currentCalcEventList: currentCalcEventList
        })
    }

    closeCalcBox() {

        let calcExpandMenu = ReactDOM.findDOMNode(this.refs.calcExpandMenu)
        // calcExpandMenu.className = "calcMenuHide"
        calcExpandMenu.classList.add("calcMenuHide")

        let calcMenu = ReactDOM.findDOMNode(this.refs.calcMenu)
        calcMenu.classList.remove("calcMenuHide")

        if(window.parent == self) { // 부모창이 없을때
            let calcMenu = ReactDOM.findDOMNode(this.refs.calcMenu)
            calcMenu.className = "calcMenuContainer sticky"
        }
        // calcMenu.className = "calcMenuContainer"

        /**
         * StickyMenu 닫았을때 박스의 크기만큼 아래로 이동
         * 20180711
         * */
        let calcContainer = document.getElementById("calcContainer")
        let topValue = calcContainer.style.top

        topValue = topValue.replace("px", "")
        topValue = (300 + parseInt(topValue)).toString() + "px"
        calcContainer.style.top = (parseInt(topValue)).toString() + "px"

        /**
         * 회차정보가 비어 있을때 속성값 변경
         * */
        if(this.props.eventsData.length == 0) {
            calcContainer.style.top = "auto"
            calcContainer.style.opacity = "1"
            calcContainer.style.position = "relative"
        }

        // 부모 iFrame reszie
        this.iFrameResize("close")

        this.setState({
            isMenuOpen: false
        })
    }

    addClassToTabClose(e) {
        e.target.classList.add('onMouseOverCloseTab')
    }

    removeClassFromTabClose(e) {
        e.target.classList.remove("onMouseOverCloseTab")
    }

    removeCalcTab (selectedCalcSet) {

        /**
         * GA: "계산기"내에 있는 '삭제'버튼 클릭 수
         * */
        let gaLabel = "proto_remove_calcSet"
        ga.ClickEvent(gaLabel)

        let removeConfirm = window.confirm("정말 삭제하시겠습니까?")
        let roundCode = this.props.roundCode
        let currentCalcEventList = []

        if(removeConfirm) {
            let calcSetList = this.state.calcSetList
            let calcSetCnt  = calcSetList.length
            let newCalcSetList = []
            let activeIndex = "empty"
            let lastSetNo = this.state.lastSetNo

            // 삭제할 탭을 제외한 새로운 어레이를 생성
            calcSetList.forEach(function(calcSet, index) {
                if(calcSetList.length  > 1) {

                    if(calcSetList.length -1 == index) {
                        if(selectedCalcSet == calcSet) {
                            lastSetNo -= 1
                        }
                    }

                    if(selectedCalcSet != calcSet) {
                        newCalcSetList.push(calcSet)
                    }

                    if(calcSet.isActive == "active" && calcSetCnt-1 == index) {
                        activeIndex = index -1
                    } else if(calcSet.isActive == "active" && selectedCalcSet == calcSet) {
                        activeIndex = index
                    }
                }
            })


            if(activeIndex != "empty") {
                newCalcSetList[activeIndex].isActive = "active"
                currentCalcEventList = newCalcSetList[activeIndex]
            }

            // Tab이 10개 미만이 되면 조합추가 탭을 노출시킨다.
            if(newCalcSetList.length < 10) {
                let calcSetAddBtn = ReactDOM.findDOMNode(this.refs.calcSetAddBtn)
                calcSetAddBtn.classList.remove("nonDisplay")
            }


            lastSetNo = newCalcSetList.length == 0 ? 1 : lastSetNo
            // LocalStorage data
            let calcLocalStorageData = {
                currentCalcEventList: currentCalcEventList,
                calcSetList: newCalcSetList,
                lastSetNo: lastSetNo,
            }

            updateLocalStorage(roundCode, calcLocalStorageData)

            // 탭을 모두 지우면 조합의 이름을 다시 초기화 시킨다
            if(newCalcSetList.length == 0) {
                this.setState({
                    currentCalcEventList : [],
                    calcSetList: newCalcSetList,
                    lastSetNo: 1
                })
            } else {
                let activeIndex = getActiveTabIndex(newCalcSetList) // 활성화 중인 탭 Index
                currentCalcEventList = newCalcSetList[activeIndex].calcSetEventList
                /**
                 * Input Tag의 value속성으로는 제어가 불가하기 때문에 아래와 같이 값을 세팅
                 * */
                let betAmount = ReactDOM.findDOMNode(this.refs.betAmount)
                let estimatePrice = ReactDOM.findDOMNode(this.refs.estimatePrice)
                betAmount.value = newCalcSetList[activeIndex].betAmount
                estimatePrice.value = newCalcSetList[activeIndex].estimatePrice
            }

            this.props.updateTableCheckList(currentCalcEventList, activeIndex)
            this.setState({
                currentCalcEventList : currentCalcEventList,
                calcSetList: newCalcSetList,
                lastSetNo: lastSetNo
            })
        } else { // confirm 취소
            return
        }
    }

    addCalcTab() {

        /**
         * 계산기 '열린' 상태의 조합추가 버튼 클릭 수
         * */
        let gaLabel = "proto_add_calcSet_status_open"
        ga.ClickEvent(gaLabel)

        let calcSetList = this.state.calcSetList
        let lastSetNo = this.state.lastSetNo
        let roundCode = this.props.roundCode

        let calcSetAddBtn = ReactDOM.findDOMNode(this.refs.calcSetAddBtn)
        if(calcSetList.length == 9) {
            calcSetAddBtn.classList.add("nonDisplay")
            window.alert('각 회차별로 10개까지만 저장가능합니다. 불필요한 저장탭 삭제바랍니다.')
        }

        let newTabInfo = {
            calcSetEventList: [],
            tabName: lastSetNo + "조합",
            isActive: "active",
            betAmount: "",
            estimatePrice: 0,
        }

        if(calcSetList.length < 10) {
            calcSetList.map((calcSet, index) => (
                calcSet.isActive = ""
            ))
            calcSetList.push(newTabInfo)
        }

        // LocalStorage data
        let calcLocalStorageData = {
            currentCalcEventList: [],
            calcSetList: calcSetList,
            lastSetNo: lastSetNo + 1,
        }
        updateLocalStorage(roundCode, calcLocalStorageData)

        let activeIndex = getActiveTabIndex(this.state.calcSetList) //현재 active되어있는 탭의 index
        this.props.updateTableCheckList([], activeIndex)

        /**
         * Input Tag의 value속성으로는 제어가 불가하기 때문에 아래와 같이 값을 세팅
         * */
        let betAmount = ReactDOM.findDOMNode(this.refs.betAmount)
        let estimatePrice = ReactDOM.findDOMNode(this.refs.estimatePrice)
        betAmount.value = ""
        estimatePrice.value = 0

        this.setState({
            currentCalcEventList: [],
            calcSetList: calcSetList,
            lastSetNo: lastSetNo + 1,
        })

    }

    switchTab(e, selectedCalcSet) {

        if(e.target.classList.contains("calcTabText")) {
            /**
             * GA: '계산기 열린 상태'에서 조합탭 클릭 수
             * */
            let gaLabel = "proto_switchTab_status_open"
            ga.ClickEvent(gaLabel)
        } else {
            /**
             * GA: '계산기 닫힌 상태'에서 조합탭 클릭 수
             * */
            let gaLabel = "proto_switchTab_status_close"
            ga.ClickEvent(gaLabel)
        }

        let calcSetList = this.state.calcSetList
        let lastSetNo = this.state.lastSetNo
        let activeIndex = 0
        let roundCode = this.props.roundCode

        calcSetList.forEach(function(calcSet, index) {
            if(selectedCalcSet == calcSet) {
                activeIndex = index
                calcSet.isActive = "active"
            } else {
                calcSet.isActive = ""
            }
        })

        let calcEventList = calcSetList[activeIndex].calcSetEventList

        // /**
        //  * NAMED-9772
        //  * [PW] 프로토 > 계산기 > 조합탭 클릭 시 경기번호가 빠른 위치로 포커싱 요청
        //  * */
        // if(calcEventList.length > 0) {
        //     this.props.scrollToEvent(calcEventList[0].seq)
        // }

        //현재 active되어있는 탭의 index
        this.props.updateTableCheckList(calcEventList, activeIndex)

        // LocalStorage data
        let calcLocalStorageData = {
            currentCalcEventList: calcEventList,
            calcSetList: calcSetList,
            lastSetNo: lastSetNo,
        }

        // 해당탭에 대한 금액 변경
        // this.setEstimatePrice()

        updateLocalStorage(roundCode, calcLocalStorageData)

        /**
         * Input Tag의 value속성으로는 제어가 불가하기 때문에 아래와 같이 값을 세팅
         * */
        let betAmount = ReactDOM.findDOMNode(this.refs.betAmount)
        let estimatePrice = ReactDOM.findDOMNode(this.refs.estimatePrice)
        betAmount.value = getAmtLocale(calcSetList[activeIndex].betAmount)
        estimatePrice.value = getAmtLocale(calcSetList[activeIndex].estimatePrice)

        this.setState({
            currentCalcEventList: calcEventList,
            calcSetList: calcSetList,
        })

    }

    getActiveClass(calcSet) {
        if(calcSet.isActive == "active") {
            return "active"
        } else {
            return ""
        }
    }

    setEstimatePrice(e) {
        if(!inspectBetAmt(e)) {
            window.alert('공식베팅 금액은 최대 10만원 입니다.')
        }

        let betAmount = getNumOnly(ReactDOM.findDOMNode(this.refs.betAmount).value)
        let estimatePriceElement = ReactDOM.findDOMNode(this.refs.estimatePrice)
        let oddRate = ReactDOM.findDOMNode(this.refs.estimateOddRate).innerHTML
        let estimatePrice = parseInt(betAmount) * parseFloat(oddRate)

        if(isNaN(estimatePrice)) {
            estimatePriceElement.value = 0
        } else {
            if(roundDown(estimatePrice, 0) > maxBetAmt) {
                window.alert("공식베팅은 적중금액을 1억원을 넘을 수 없습니다.")
                estimatePrice = maxBetAmt
                estimatePriceElement.value = getAmtLocale(estimatePrice)
            } else {
                estimatePrice = roundDown(estimatePrice, 0)
                estimatePriceElement.value = getAmtLocale(estimatePrice)
            }
        }

        // LocalStorage data
        let roundCode = this.props.roundCode
        let calcSetList = this.state.calcSetList
        let activeIndex = getActiveTabIndex(calcSetList) // 활성화 중인 탭 Index
        calcSetList[activeIndex].betAmount = betAmount
        calcSetList[activeIndex].estimatePrice = estimatePrice

        let calcLocalStorageData = {
            currentCalcEventList: this.state.currentCalcEventList,
            calcSetList: calcSetList,
            lastSetNo: this.state.lastSetNo,
        }
        updateLocalStorage(roundCode, calcLocalStorageData)
        // End localStorage data
    }

    removeCalcRow(e) {
        /**
         * GA 계산기내에 있는 경기 삭제버튼 클릭수
         * */
        let gaLabel = "proto_remove_calcRow"
        ga.ClickEvent(gaLabel)

        let selectedRowSeqNo = e.target.closest("tr").cells[0].textContent
        let calcEventList = this.state.currentCalcEventList
        let calcSetList = this.state.calcSetList
        let roundCode = this.props.roundCode

        calcEventList.forEach(function(event, index) {
            if(event.seq == parseInt(selectedRowSeqNo)) {
                calcEventList.splice(index, 1)
                return
            }
        })

        // 예상 적중금 금액 변경
        let betAmount = getNumOnly(ReactDOM.findDOMNode(this.refs.betAmount).value)
        let estimatePriceElement = ReactDOM.findDOMNode(this.refs.estimatePrice)
        let oddRate = getEstimateOddRate(this.state.currentCalcEventList, "multiple")

        let estimatePrice = parseInt(betAmount) * parseFloat(oddRate)
        if(isNaN(estimatePrice)) {
            estimatePrice = 0
            estimatePriceElement.value = getAmtLocale(estimatePrice)
        } else {
            estimatePrice = roundDown(estimatePrice, 0)
            estimatePriceElement.value = getAmtLocale(estimatePrice)
        }


        let calcLocalStorageData = {
            currentCalcEventList: calcEventList,
            calcSetList: calcSetList,
            lastSetNo: this.state.lastSetNo,
        }
        updateLocalStorage(roundCode, calcLocalStorageData)

        this.props.removeCalcCheckList(selectedRowSeqNo)
        this.setState({
            currentCalcEventList: calcEventList,
        })
    }

    hideIfAbroad() {
        let isAbroad = this.props.isAbroad

        if(isAbroad) {
            return "nonDisplay"
        } else {
            return ""
        }
    }

    getCalcTitle() {
        let roundCode = this.props.roundCode
        let year = "20" + roundCode.substr(0,2) + "년 "

        let round = roundCode.substr(3,5) + "회차 "
        if(round.charAt(0) == '0') {
            round = roundCode.substr(4,5) + "회차 "
        }

        return year + round
    }

    getEmptyStatus() {
        if(this.state.currentCalcEventList.length > 0) {
            return "nonDisplay"
        } else {
            return ""
        }
    }

    getCalcMenuDisplay() {
        let calcSetList = this.state.calcSetList
        if(calcSetList.length > 0) {
            return "nonDisplay"
        } else {
            return ""
        }
    }

    getCalcTdClass(event, type) {
        let latestOdd = getLatestOdd(event.odds)

        if(latestOdd.status == type) {
            return "calcWin"
        } else {
            return ""
        }
    }

    getCorrectionMark(seq) {
        let currentCalcEventList = this.state.currentCalcEventList
        let correctMark = ""

        currentCalcEventList.some(function(calcEvent, index) {
            if(calcEvent.seq == seq) {
                if(calcEvent.calcStatus.chkCorrection) {
                    correctMark = "correctCircleMark"
                    return true
                }
            }
        })

        return correctMark
    }

    // index.js 에서 호출
    initializeCalc(roundCode) {
        // console.log("initializeCalc")

        let localStorageData = getLocalStorage(roundCode)
        let calcSetList = localStorageData.calcSetList
        let activeIndex = getActiveTabIndex(calcSetList) // 활성화 중인 탭 Index

        if(calcSetList.length == 0) {
            this.props.updateTableCheckList([], activeIndex)
        } else {
            let calcEventList = calcSetList[activeIndex].calcSetEventList
            this.props.updateTableCheckList(calcEventList, activeIndex)
        }

        let betAmount = ReactDOM.findDOMNode(this.refs.betAmount)
        let estimatePrice = ReactDOM.findDOMNode(this.refs.estimatePrice)
        if(calcSetList.length > 0) {
            betAmount.value = getAmtLocale(calcSetList[activeIndex].betAmount)
            estimatePrice.value = getAmtLocale(calcSetList[activeIndex].estimatePrice)
        } else {
            betAmount.value = ""
            estimatePrice.value = 0
        }

        this.setState({
            currentCalcEventList: localStorageData.currentCalcEventList,
            calcSetList: calcSetList,
            lastSetNo: localStorageData.lastSetNo,
        })
    }

    getCalcSetAddBtnDisplay() {
        let calcSetList = this.state.calcSetList

        if(calcSetList.length == 10) {
            return "nonDisplay"
        } else {
            return ""
        }
    }

    iFrameResize(type) {
        /**
         * MenuBox를 Open 할 때 componentDidUpdate 호출 (Close때는 호출안함)
         * */
        const headerHeight = pageHeaderHeight
        const rowsHeight = singleRowHeight * this.props.eventsData.length
        const footerHeight = pageFooterHeight + 40
        const parentHeight = 150
        const tableHeight = headerHeight + rowsHeight + footerHeight + parentHeight

        if(type == "open") {
            parent.window.postMessage( JSON.stringify({
                method: "resize",
                height: tableHeight + 340,
                src: location.href
            }), '*')
        } else {
            parent.window.postMessage( JSON.stringify({
                method: "resize",
                height: tableHeight,
                src: location.href
            }), '*')
        }
    }

    adjustOffsetHeight() {
        let calcContainer = document.getElementById("calcContainer")
        let isMenuOpen = this.state.isMenuOpen
        if(calcContainer != null) {
            if(isMenuOpen) {
                let calcContainer = document.getElementById("calcContainer")
                let topValue = calcContainer.style.top
                topValue = topValue.replace("px", "")
                calcContainer.style.top = (topValue - 300) + "px"
            } else {
                let topValue = calcContainer.style.top
                topValue = topValue.replace("px", "")
                topValue = (300 + parseInt(topValue)).toString() + "px"
                calcContainer.style.top = (parseInt(topValue)).toString() + "px"
            }
        }
    }

    adjustMenuBar() {
        /**
         * 종목변경시 특정종목에 Event가 하나도 발견되지 않을시
         * calcContainer.offsetHeight 값이 = 0 으로 세팅이 되고 다시
         * 다른 종목으로 이동할 때 Event가 있음에도 offsetHeight값이 0 지정되어있어
         * 하단 메뉴바가 안보이는 현상이 있어 라이프사이클에 같은 로직을 중첩시켜 해결함
         * */
        if(window.parent != self) { // 부모창이 있을때
            const headerHeight = pageHeaderHeight
            const rowsHeight = singleRowHeight * this.props.eventsData.length
            const footerHeight = pageFooterHeight + 40
            const tableHeight = headerHeight + rowsHeight + footerHeight
            let scrollY = 0

            window.addEventListener('message', function (e) {
                try {
                    if (e.data.hasOwnProperty("cmd")) {
                        if (e.data.cmd === 'fixCalculatorToBottomOfViewport') {
                            let calcContainer = document.getElementById("calcContainer")

                            scrollY = e.data.offsetTopValue - parseInt(calcContainer.offsetHeight)

                            if (tableHeight > scrollY) {
                                calcContainer.style.top = scrollY + "px"
                                calcContainer.style.opacity = "1"
                                calcContainer.style.position = "absolute"
                            } else {
                                calcContainer.style.top = "auto"
                                calcContainer.style.opacity = "1"
                                calcContainer.style.position = "relative"
                            }
                        }
                    }
                } catch (e) {
                    console.error(e);
                }
            }, false);
        }
    }

    componentDidMount() {
        // localStorage.clear(); // 로컬 스토리지 전체 삭제
        let roundCode = this.props.roundCode
        let localStorageData = getLocalStorage(roundCode)

        parent.window.postMessage({
            cmd: 'protoDidMount',
        }, '*');

        this.setState({
            currentCalcEventList: localStorageData.currentCalcEventList,
            calcSetList: localStorageData.calcSetList,
            lastSetNo: localStorageData.lastSetNo,
        })

    }

    componentDidUpdate(prevProps, prevState) {
        this.adjustMenuBar()
    }

    render() {

        if(window.parent != self) { // 부모창이 있을때
            this.adjustMenuBar()
        } else { // 부모창이 없을때

            if(isSafari() || isSamsung()) {

                window.addEventListener("touchmove", scrollMove, false);
                window.addEventListener("scroll", scrollEnd, false);
                window.addEventListener("touchEnd", scrollTouchEnd, false);

                let calcContainer = document.getElementById("calcContainer")
                let offSetHeight = 0

                function adjustMenu() {
                    if(offSetHeight >= document.body.offsetHeight-150) {
                        calcContainer.style.top = "auto"
                        calcContainer.style.position = "relative"
                    } else {
                        calcContainer.style.top = offSetHeight+"px"
                        calcContainer.style.display = "unset"
                        calcContainer.style.position = "absolute"
                    }
                }

                function scrollMove() {
                    offSetHeight = window.innerHeight+document.body.scrollTop-38
                    adjustMenu()
                }

                function scrollEnd() {
                    setTimeout(getScrollPosition, 100)
                }

                function getScrollPosition() {
                    offSetHeight = window.innerHeight+document.body.scrollTop-38
                    adjustMenu()
                }

                function scrollTouchEnd() {
                    adjustMenu()
                }

            } else {
                // --- Sticky Menu --- //
                const self = this
                let maxYScroll = 0

                window.onscroll = function() {

                    // 계산기 메뉴 Close Mode일때
                    let calcMenu = ReactDOM.findDOMNode(self.refs.calcMenu)

                    // Check if menu has hide className
                    let calcMenuClassArr = calcMenu.className.split(" ")
                    if(calcMenuClassArr.indexOf("calcMenuHide") == -1) {
                        if ((window.innerHeight + document.documentElement.scrollTop) + 35 >= document.body.offsetHeight) {
                            calcMenu.className = "calcMenuContainer"
                        } else {
                            calcMenu.className = "calcMenuContainer sticky"
                        }
                    }


                    // 계산기 메뉴 Open Mode일때
                    let calcExpandMenu = ReactDOM.findDOMNode(self.refs.calcExpandMenu)
                    let calcExpandMenuClassArr = calcExpandMenu.className.split(" ")

                    if(calcExpandMenuClassArr.indexOf("calcMenuHide") == -1) {
                        // IE는 position:sticky를 지원하지 않습니다. pollyfill을 모색해봤으나 알맞은 lib을 찾지 못함

                        if(isIE()) {
                            if(maxYScroll == 0) {
                                maxYScroll = document.documentElement.scrollHeight - document.documentElement.clientHeight
                            }

                            if (maxYScroll > document.documentElement.scrollTop + 100) {
                                calcExpandMenu.className = "calcExpandMenuContainer sticky"
                            } else {
                                calcExpandMenu.className = "calcExpandMenuContainer"
                            }
                        } else { // chrome, firefox
                            if ((window.innerHeight + document.documentElement.scrollTop) >= document.body.offsetHeight) {
                                calcExpandMenu.className = "calcExpandMenuContainer"
                            } else {
                                calcExpandMenu.className = "calcExpandMenuContainer sticky"
                            }
                        }
                    }
                };

                // --- End Sticky Menu --- //

            } // end isSafari * Samsung
        }

        return (
            <div className={"calcContainer " + addClassifiFrame() + this.hideIfAbroad()} id={"calcContainer"} ref={"calcContainer"}>
                <div className={"calcMenuContainer " + getStickyifiFrame()} ref="calcMenu">
                    <div className="calcMenuLeftText">조합한 내역</div>

                    <div className={"calcMenuCenterTextContainer " + this.getCalcMenuDisplay()}>
                        <div className="calcNoticeSymbol">!</div>
                        <div className="calcNoticeText typeA">계산기 사용안내:</div>
                        <div className="calcNoticeText typeB">위 경기별</div>
                        <div className="calcNoticeText typeC">[배당률 체크박스]</div>
                        <div className="calcNoticeText typeB">또는</div>
                        <div className="calcNoticeText typeC">[+조합추가]</div>
                        <div className="calcNoticeText typeD">를 클릭해보세요.</div>
                    </div>

                    <span className={"calcMenuSetList"}>
                    {
                        this.state.calcSetList.map((calcSet, index) => (
                            <a key={"calcMenuSet_"+index}
                                 className={"calcMenuSet " + this.getActiveClass(calcSet)}
                                 onClick={(e) =>{
                                     this.openCalcBox()
                                     this.switchTab(e, calcSet)
                                 }}>
                                {calcSet.tabName}
                            </a>
                        ))
                    }
                    <a className={"calcAddOddSetBtn " + this.getCalcSetAddBtnDisplay()}
                           onClick={(e) =>{
                               this.openCalcBox()
                               this.addCalcTab()
                           }}>
                        <img src={`${publicRuntimeConfig.SUB_NAME}/static/img/calcAddIcon.png`}
                             className="calcAddIcon" />
                        <div className="calcAddBtnText">조합추가</div>
                    </a>
                    </span>
                    <div className={"calcMenuDummy"}></div>
                </div>

                <div className={"calcExpandMenuContainer calcMenuHide " + getStickyifiFrame()} id={"calcExpandMenu"} ref="calcExpandMenu">
                    <div className="calcMenuHeader">
                        <div className="calcMenuLogo">
                            <img src={`${publicRuntimeConfig.SUB_NAME}/static/img/calc_logo.png`}
                                 className="calcIcon" />
                        </div>

                        <div className="calcMenuTitle">{this.getCalcTitle()}{"("+this.state.calcSetList.length+"/10)"}</div>

                        <a className="calcCloseBoxContainer"
                             onClick={(e) => this.closeCalcBox()}>
                            <div className="calcCloseBox">
                                <div className="closeIcon"></div>
                            </div>
                        </a>
                    </div>

                    <div className="calcTabContainer" ref={"calcTabContainer"}>
                        {
                            this.state.calcSetList.map((calcSet, index) => (
                                <span className={"calcTab "+calcSet.isActive}
                                      key={"tab_" + index + 1}
                                      id={"tab_" + index + 1}>
                                    <a className="calcTabText"
                                         onClick={(e) => this.switchTab(e, calcSet)}>{calcSet.tabName}</a>
                                    <a className="calcTabCloseBtn"
                                         onMouseOver={(e) => this.addClassToTabClose(e)}
                                         onMouseOut={(e) => this.removeClassFromTabClose(e)}
                                         onClick={(e) => this.removeCalcTab(calcSet)}>{}</a>
                                </span>
                            ))
                        }
                        <a className={"calcSetAddBtn " + this.getCalcSetAddBtnDisplay()}
                             ref={"calcSetAddBtn"}
                             onClick={(e) => this.addCalcTab()}>
                            <img src={`${publicRuntimeConfig.SUB_NAME}/static/img/calcAddIcon.png`} className="calcAddIcon" />
                            <div className="calcAddBtnText">조합추가</div>
                        </a>
                    </div>

                    <div className="calcTableContainer">
                        <table className="calcTable">
                            <thead>
                                <tr className="calcTableHeader">
                                    <th>번호</th>
                                    <th>경기일시</th>
                                    <th>대회명</th>
                                    <th>유형</th>
                                    <th>홈팀 vs 원정팀</th>
                                    <th colSpan="3">조합내역/결과</th>
                                    <th>삭제</th>
                                    <th className="dummyTh">{''}</th>
                                </tr>
                            </thead>
                            <tbody id={"calcTableBody"}>
                                <tr className={"calcEmptyNotice " + this.getEmptyStatus()}>
                                    <td colSpan="11" className={"calcEmptyTd"}>
                                        <img src={`${publicRuntimeConfig.SUB_NAME}/static/img/calcEmptyIcon.gif`}
                                             className="calcEmptyIcon" />
                                        <div>위 배당률 체크박스에서 예상결과를 선택해주세요.</div>
                                    </td>
                                </tr>
                            {
                                this.state.currentCalcEventList.map((event, index) => (
                                <tr key={event.id}>
                                    <td className={"calcEventSeqTd"}
                                        onClick={(e) => this.props.scrollToEvent(event.seq)}>
                                        <div className={this.getCorrectionMark(event.seq)}></div>
                                        <div className={"calcSeqNo"}>{event.seq}</div>
                                    </td>
                                    <td onClick={(e) => this.props.scrollToEvent(event.seq)}>
                                        <div className="calcListDate">{getFormatDate(event.startAt).date}</div>
                                        <div className="calcListTime">{getFormatDate(event.startAt).time}</div>
                                    </td>
                                    <td onClick={(e) => this.props.scrollToEvent(event.seq)}>{event.league}</td>
                                    <td onClick={(e) => this.props.scrollToEvent(event.seq)}>
                                        <div>
                                            <a className={"calcListEventType "+getCalcEventTypeColor(event)}>
                                                {getNameOfEventType(getLatestOdd(event.odds).type)}
                                            </a>
                                        </div>
                                    </td>
                                    <td onClick={(e) => this.props.scrollToEvent(event.seq)}>
                                        <div className="calcHome">
                                            {event.homeTeam}
                                            <div className={"calcOption " + getOptionType(event)}>
                                                {getOptionVal(event)}
                                            </div>
                                        </div>

                                        <div className="calcVsBox"> vs </div>
                                        <div className="calcAway">{event.awayTeam}</div>
                                    </td>

                                    <td className={"calcListResultContainerTd " + this.getCalcTdClass(event, "ONE")}
                                        onClick={(e) => this.props.scrollToEvent(event.seq)}>
                                        <div className="calcListResultContainer one">
                                            {isUserChkBox(event, "one") ? "" : "-"}
                                            <div className={getNonDisplayChkBox(event, "one")}>
                                                <label className="calcInputContainer oneRate" id="ONE">
                                                    <input type = "checkbox"
                                                           name = {"calcOdd_"+event.seq}
                                                           checked={isChecked(event, "one")}
                                                           readOnly />
                                                    <span className={"oddCheckBox " + getCalcChkBoxColor(event, "one")}></span>
                                                </label>

                                                <div className={"calcOddText one"}>
                                                    {getCalcOddText(event, "one")}
                                                </div>

                                                <div className="calcOddRate">{getLatestOdd(event.odds).oneRate}</div>
                                            </div>
                                        </div>
                                    </td>

                                    <td className={"calcListResultContainerTd " + this.getCalcTdClass(event, "X")}
                                        onClick={(e) => this.props.scrollToEvent(event.seq)}>
                                        <div className="calcListResultContainer x">
                                            {isUserChkBox(event, "x") ? "" : "-"}
                                            <div className={getNonDisplayChkBox(event, "x")}>
                                                <label className="calcInputContainer xRate" id="X">
                                                    <input type = "checkbox"
                                                           name = {"calcOdd_"+event.seq}
                                                           checked={isChecked(event, "x")}
                                                           readOnly />
                                                    <span className={"oddCheckBox " + getCalcChkBoxColor(event, "x")}></span>
                                                </label>

                                                <div className={"calcOddText x"}>
                                                    {getCalcOddText(event, "x")}
                                                </div>

                                                <div className="calcOddRate">{getLatestOdd(event.odds).xrate}</div>
                                            </div>
                                        </div>
                                    </td>

                                    <td className={"calcListResultContainerTd " + this.getCalcTdClass(event, "TWO")}
                                        onClick={(e) => this.props.scrollToEvent(event.seq)}>
                                        <div className="calcListResultContainer two ">
                                            {isUserChkBox(event, "two") ? "" : "-"}
                                            <div className={getNonDisplayChkBox(event, "two")}>
                                                <label className="calcInputContainer twoRate" id="TWO">
                                                    <input type = "checkbox"
                                                           name = {"calcOdd_"+event.seq}
                                                           checked={isChecked(event, "two")}
                                                           readOnly />
                                                    <span className={"oddCheckBox " + getCalcChkBoxColor(event, "two")}></span>
                                                </label>

                                                <div className={"calcOddText two"}>
                                                    {getCalcOddText(event, "two")}
                                                </div>

                                                <div className="calcOddRate">{getLatestOdd(event.odds).twoRate}</div>
                                            </div>
                                        </div>
                                    </td>

                                    <td colSpan={"2"}>
                                        <div className="calcListDeleteBox"
                                             onClick={(e) => this.removeCalcRow(e)}>삭제</div>
                                    </td>
                                    <td></td>
                                </tr>
                                ))
                            }
                            </tbody>
                        </table>
                    </div>

                    <div className="calcMenuFooter">
                        <div className="calcPickInfoContainer">
                            <div className="calcPickInfoRightArrow"></div>
                            <div className="calcPickInfo cntSelectedEventsText">선택 경기수:</div>
                            <div className="calcPickInfo cntSelectedEvents">{this.state.currentCalcEventList.length}경기</div>

                            <div className="calcPickInfoRightArrow"></div>
                            <div className="calcPickInfo betAmtText">베팅금액:</div>
                            <input className="calcPickInfo betAmtBox"
                                   maxLength={7}
                                   onChange={(e) => this.setEstimatePrice(e)}
                                   ref={"betAmount"}/>
                            <div className="calcPickInfo betAmtCurrency">원</div>

                            <br />

                            <div className="calcPickInfoRightArrow"></div>
                            <div className="calcPickInfo estimateOddText">예상 배당률:</div>
                            <div className="calcPickInfo estimateOdd" ref={"estimateOddRate"}>
                                {getEstimateOddRate(this.state.currentCalcEventList, "multiple")}배
                            </div>

                            <div className="calcPickInfoRightArrow"></div>
                            <div className="calcPickInfo estimateRateText">예상 수익률:</div>
                            <div className="calcPickInfo estimateRate">
                                {getEstimateOddRate(this.state.currentCalcEventList, "percentage")}%
                            </div>
                        </div>

                        <div className="estimatePriceContainer">
                            <div className="estimatePrice calcRightArrow"></div>
                            <div className="estimatePrice text">예상 적중금:</div>
                            <input className="estimatePrice amount"
                                   ref={"estimatePrice"}
                                   readOnly />
                            <div className="estimatePrice currency">원</div>
                        </div>

                    </div>
                </div>
            </div>
        )
    }
}

export default StickyMenu
