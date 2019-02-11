import {Component} from 'react'
import Layout from '../layout/common_layout.js'
import getConfig from 'next/config'
import TableComp from '../components/tableComp'
import HeaderComp from '../components/headerComp'
import StickyMenuComp from '../components/calc_components/stickyMenu'
import axios from 'axios'
import qs from 'qs'
import ga from '../components/GAModule'
import ReactGA from 'react-ga'
import {
    createPolyFill,
    getLocalStorage
} from '../static/js/common_help'
import {
    getUpdateBaseballEvents,
    getUpdateSoccerEvents,
    getUpdateBasketballEvents,
    getUpdateVolleyballEvents,
    updateEventDataWithLiveScore
}  from '../static/js/message_converter'

const {publicRuntimeConfig} = getConfig()

const pageHeaderHeight = publicRuntimeConfig.PAGE_HEADER_HEIGHT
const singleRowHeight = publicRuntimeConfig.TABLE_ROW_HEIGHT
const pageFooterHeight = publicRuntimeConfig.PAGE_FOOTER_HEIGHT

class Index extends Component {

    constructor(props) {
        // console.log("constructor")

        super(props)

        this.state = {
            scheduleData: {},     // 최초 호출한 프로토 Data
            originalEventsData: {}, // 최초 화면에 가져온 Event Data
            currentEventsData: {},// 현재 화면에 출력되는 Event Data
            seqOrder: "orderAsc", // Acs: 오름차순 , Desc: 내림차순
            roundData: {},        // ex 120, 119, 118, 117 ... 회차 리스트
            roundCode: 0,         // ex 180041
            roundMax:0,           // 회차변경 버튼 비활성화를 위한 값
            roundMin:0,           // 회차변경 버튼 비활성화를 위한 값
            currentSports: "",    // 현재 확인 종목 (전체, 축구, 야구 ...)
            currentYear: 0,       // 현재 확인중인 프로토 연도
            isAbroad: false,      // 해외 배당
            liveScore: {},        // 라이브 스코어 데이터
            loadingFlag: false,   // 렌더링 플레그
            calcEventList: [],    // 현재 체크되어있는 이벤트
            uncheckSeqNo: 0,      // 계산기에서 삭제한 Seq No
            activeIndex: 0,       // 계산기 탭 Active 번호
        }

        this.changeSeqOrder = this.changeSeqOrder.bind(this)
        this.changeRound = this.changeRound.bind(this)
        this.switchSports = this.switchSports.bind(this)
        this.changeYear = this.changeYear.bind(this)
        this.switchAbroad = this.switchAbroad.bind(this)
        this.doMediate = this.doMediate.bind(this)
        this.calcMediate = this.calcMediate.bind(this)
        this.removeCalcCheckList = this.removeCalcCheckList.bind(this)
        this.updateTableCheckList = this.updateTableCheckList.bind(this)
        this.scrollToEvent = this.scrollToEvent.bind(this)

        this.HeaderComp = React.createRef()
        this.TableComp = React.createRef()
        this.StickyMenuComp = React.createRef()
    }

    // 푸쉬웹 서버에서 변경된 프로토 데이터를 업데이트
    substituteData(eventMessage) {

        // console.log("substituteData")

        let scheduleData = this.state.scheduleData
        let currentSports = this.state.currentSports
        let shouldUpdate = false

        scheduleData.events.forEach(function(event, index) {
            if(event.id === eventMessage.id) {
                shouldUpdate = true

                /**
                 * 배당률 변경이 parser로 내려올때는 리그명, 팀네임이 내려오지 않기 때문에
                 * parser내려올 때 변경될수있는 status, odds만 수정
                 * 20180611 by CkHong
                 * */
                if(!eventMessage.hasOwnProperty("league"))
                {
                    scheduleData.events[index].status = eventMessage.status
                    scheduleData.events[index].odds = eventMessage.odds
                } else {
                    scheduleData.events[index] = eventMessage
                }

            }
        })

        if(shouldUpdate) {
            let updateEventsData = {}
            if(currentSports == "ALL") {
                updateEventsData = scheduleData.events
            } else {
                updateEventsData = []
                scheduleData.events.forEach(function(event, index) {
                    if(event.sports == currentSports) { updateEventsData.push(event) }
                })
            }

            this.setState({
                scheduleData: scheduleData,
                currentEventsData: updateEventsData
            })
        }
    }

    // 푸쉬웹 서버에서 변경된 스코어 데이터를 업데이트
    updateScoreData(eventMessage, topic) {

        // console.log("updateScoreData")

        let updateEventsData = {}
        let currentSports = this.state.currentSports
        let originEventsData = this.state.originEventsData

        if(topic == "score.basketball.schedule") { // basketball
            updateEventsData = getUpdateBasketballEvents(eventMessage, originEventsData)
        } else {
            if(topic == "named.score.web.baseball") {
                updateEventsData = getUpdateBaseballEvents(eventMessage, originEventsData)
            } else if(topic == "named.score.web.football") {
                updateEventsData = getUpdateSoccerEvents(eventMessage, originEventsData)
            } else if(topic == "named.score.volleyball") {
                updateEventsData = getUpdateVolleyballEvents(eventMessage, originEventsData)
            }
        }

        if(updateEventsData != false) { // 업데이트할 데이터가 있다면

            this.setState({ originEventsData : updateEventsData })

            if(currentSports == "ALL") {
                this.setState({ currentEventsData : updateEventsData })
            } else {
                let eventData = []
                originEventsData.forEach(function(event, index) {
                    if(event.sports === currentSports) eventData.push(event)
                })

                this.setState({ currentEventsData: eventData })
            }
        }
    }

    // 데이터 역순으로 변경
    changeSeqOrder() {

        // console.log("changeSeqOrder")

        this.refs.childTableComp.hidePopup();

        if(this.state.seqOrder === "orderAsc") {
            this.setState({ seqOrder: "orderDesc" })
        } else {
            this.setState({ seqOrder: "orderAsc" })
        }

        this.setState({ currentEventsData: this.state.currentEventsData.reverse() })
    }

    // 회차 변경
    async changeRound(e, triggerByBtn) {

        // console.log("changeRound")

        // 팝업창이 열려있다면 닫는다.
        this.refs.childTableComp.hidePopup();

        let self = this
        let currentSports = this.state.currentSports
        let currentEventsData = []
        let scheduleData = ""
        let roundCode = e.target.value
        let liveScore = ""
        let tableHeight = ""


        if(typeof triggerByBtn === "boolean") {
            if(triggerByBtn) {
                roundCode = parseInt(this.state.roundCode) + 1
            } else {
                roundCode = parseInt(this.state.roundCode) - 1
            }
        }
        roundCode = roundCode.toString()

        const getScheduleUrl = publicRuntimeConfig.API_URL+'/schedule?roundType=PROTO_WIN&roundCode='+ roundCode

        await axios.get(getScheduleUrl, publicRuntimeConfig.REQ_HEADER)
            .then(function(response) {
                scheduleData = response.data.response
                /**
                 * Resize 변경요청
                 * */
                let calcExpandMenuContainer = document.getElementById("calcExpandMenu")
                let menuHeight = 40

                if(calcExpandMenuContainer != null) {
                    let hasHideClass = calcExpandMenuContainer.classList.contains("calcMenuHide")
                    if(hasHideClass) {
                        menuHeight = 40
                    } else {
                        menuHeight = 340
                    }
                }
                const headerHeight = pageHeaderHeight
                const rowsHeight = singleRowHeight * scheduleData.events.length
                const footerHeight = pageFooterHeight + menuHeight
                tableHeight = headerHeight + rowsHeight

                parent.window.postMessage(JSON.stringify({
                    method: "resize",
                    height: headerHeight + rowsHeight + footerHeight + menuHeight,
                    src: location.href
                }), '*')

                const localTime = new Date()
                const fullDate = localTime.getFullYear()+"-"+(localTime.getMonth()+1)+"-"+localTime.getDate()
                const LIVE_SCORE_PARAMS = {
                    date: fullDate,
                    football_mode: "7m"
                }

                return axios.post(publicRuntimeConfig.LIVE_SCORE, qs.stringify(LIVE_SCORE_PARAMS), {
                    header: publicRuntimeConfig.AJAX_HEADER
                })
            }).then(function(response) {
                liveScore = response.data.data

                currentEventsData = updateEventDataWithLiveScore(scheduleData.events, liveScore)

                self.setState({
                    scheduleData: scheduleData,
                    originEventsData: scheduleData.events,
                    currentEventsData: currentEventsData,
                    currentSports: currentSports,
                    roundCode: roundCode,
                    currentSports: "ALL",
                    seqOrder: "orderAsc"
                })

                return true

            }).then(function(response) {
            self.refs.childStickyMenuComp.initializeCalc(roundCode); // Local Storage

        })
    }

    // 종목별 Data Sorting
    switchSports(sportsName) {
        // 팝업창이 열려있다면 닫는다.
        this.refs.childTableComp.hidePopup();

        /**
         * 20180612. GA 라벨링
         * */
        let gaLabel = "proto_category_"+sportsName
        ga.ClickEvent(gaLabel)

        let calcExpandMenuContainer = document.getElementById("calcExpandMenu")
        let menuHeight = 40

        if(calcExpandMenuContainer != null) {
            let hasHideClass = calcExpandMenuContainer.classList.contains("calcMenuHide")
            if(hasHideClass) {
                menuHeight = 40
            } else {
                menuHeight = 340
            }
        }

        let eventData = []
        let originalEventsData = this.state.originEventsData

        if (sportsName === "ALL") {
            /**
             * If 문 밖에 PostMessage를 했을시
             * 종목 이동별 문제가 발생하여 분기처리 적용
             * */
            const headerHeight = pageHeaderHeight
            const rowsHeight = singleRowHeight * originalEventsData.length
            const footerHeight = pageFooterHeight + menuHeight

            parent.window.postMessage(JSON.stringify({
                method: "resize",
                height: headerHeight + rowsHeight + footerHeight,
                src: location.href
            }), '*')

            parent.window.postMessage({
                cmd: 'protoDidMount',
            }, '*');

            this.setState({
                currentEventsData: originalEventsData,
                currentSports: sportsName
            })
        } else {

            originalEventsData.forEach(function(event, index) {
                if(event.sports === sportsName) eventData.push(event)
            })

            /**
             * 20180614 by. CkHong
             * 종목 변경했을때 iFrame 호출자 Height 변경
             */
            let length = eventData.length > 0 ? eventData.length : 3 // 3-> "해당프로토회차..." 문구 만큼의 높이값

            const headerHeight = pageHeaderHeight
            const rowsHeight = singleRowHeight * length
            const footerHeight = pageFooterHeight + menuHeight

            parent.window.postMessage(JSON.stringify({
                method: "resize",
                height: headerHeight + rowsHeight + footerHeight,
                src: location.href
            }), '*')

            parent.window.postMessage({
                cmd: 'protoDidMount',
            }, '*');

            this.setState({
                currentEventsData: eventData,
                currentSports: sportsName
            })
        }
    }

    //프로토 연도 변경
    async changeYear(isIncrease) {

        // console.log("changeYear")

        // 팝업창이 열려있다면 닫는다.
        this.refs.childTableComp.hidePopup();

        let dateObj = new Date()
        let currYear = dateObj.getFullYear()
        let year = this.state.currentYear
        let shouldUpdate = false
        let roundListResult = ""
        let roundMin = ""
        let roundMax = ""

        let calcExpandMenuContainer = document.getElementById("calcExpandMenu")
        let menuHeight = 40
        if(calcExpandMenuContainer != null) {
            let hasHideClass = calcExpandMenuContainer.classList.contains("calcMenuHide")
            if(hasHideClass) {
                menuHeight = 40
            } else {
                menuHeight = 340
            }
        }
        const headerHeight = pageHeaderHeight
        let rowsHeight = singleRowHeight * this.state.currentEventsData.length
        const footerHeight = pageFooterHeight + menuHeight

        if(isIncrease) {
            if(year != currYear && year < currYear) {
                year += 1
                shouldUpdate = true
            }
        } else {
            if(year - 1 >= 2014) {// 2014년도가 조회할 수 있는 최소값
                year -= 1
                shouldUpdate = true
            }
        }

        if(shouldUpdate) {

            const getRoundListUrl = publicRuntimeConfig.API_URL + '/round?type=PROTO_WIN&year=' + year
            // const roundListResult = await axios.get(getRoundListUrl, publicRuntimeConfig.REQ_HEADER)
            const response = await axios.get(getRoundListUrl, publicRuntimeConfig.REQ_HEADER)

            roundListResult = response.data.response

            // 이번년도의 Proto 정보를 조회한다면 = onSale 중인 라운드 회차가 있다
            let roundCode = ""
            if(currYear == year) {
                roundListResult.some(function (round) {
                    if (round.onSale) {
                        roundCode = round.code;
                        return true // break
                    }
                })
            } else { // 이번년도의 Proto 정보를 조회하지 않는다면 = onSale이 없기때문에 마지막 라운드 회차를 불러온다.
                if(roundListResult.length != 0) {
                    let lastElementIndex = roundListResult.length - 1
                    roundCode = roundListResult[lastElementIndex].code
                }
            }

            roundMin = roundListResult[0].code
            roundMax = roundListResult[roundListResult.length-1].code

            if(roundCode != "") {
                const getScheduleUrl = publicRuntimeConfig.API_URL + '/schedule?roundType=PROTO_WIN&roundCode=' + roundCode
                const scheduleResult = await axios.get(getScheduleUrl, publicRuntimeConfig.REQ_HEADER)

                rowsHeight = 68 * scheduleResult.data.response.events.length

                this.setState({
                    scheduleData: scheduleResult.data.response,
                    originEventsData: scheduleResult.data.response.events,
                    currentEventsData: scheduleResult.data.response.events,
                    roundData: roundListResult,
                    roundMin : roundMin,
                    roundMax : roundMax,
                    currentSports: "ALL",
                    currentYear: year,
                    roundCode: roundCode,
                    seqOrder: "orderAsc"
                })

                /**
                 * localStorage
                 * */
                this.refs.childStickyMenuComp.initializeCalc(roundCode);

                /**
                 * select tag 값 변경
                 * */
                this.refs.HeaderComp.setDefaultValue(roundCode);
            }
        }

        parent.window.postMessage(JSON.stringify({
            method: "resize",
            height: headerHeight + rowsHeight + footerHeight,
            src: location.href
        }), '*')
    }

    // 해외배당률 변경
    switchAbroad(isAbroad) {
        // console.log("siwtchAbroad")
        /**
         * 20180612. GA 라벨링
         * */

        let name = "domestic"
        if(isAbroad) name = "abroad"
        let gaLabel = "proto_odds_type_"+name
        ga.ClickEvent(gaLabel)

        this.setState({
            isAbroad : isAbroad
        })

        parent.window.postMessage({
            cmd: 'protoDidMount',
        }, '*');

    }

    // 중개 Method Between "stickMenu" and "oddComp"
    doMediate(event, isUnCheck, isSibling, calcStatus) {
        this.refs.childStickyMenuComp.openCalcBox();
        this.refs.childStickyMenuComp.setCalcList(event, isUnCheck, isSibling, calcStatus);
    }

    calcMediate(calcEvent) {
        this.refs.childStickyMenuComp.updateCalcTableCheckStatus(calcEvent);
    }

    removeCalcCheckList(selectedRowSeqNo) {
        this.setState({
            uncheckSeqNo: selectedRowSeqNo
        })
    }

    updateTableCheckList(calcEventList, activeIndex) {
        this.setState({
            calcEventList: calcEventList,
            activeIndex: activeIndex
        })
    }

    scrollToEvent(seq) {
        /**
         * GA: "계산기"내에 있는 '선택된 경기' 클릭 수
         * */
        let gaLabel = "proto_click_to_focus"
        ga.ClickEvent(gaLabel)

        this.refs.childTableComp.scrollToEvent(seq);
    }

    /**
     * 20180605 by. Ckhong
     * 번들링 이슈로 인한 SSR -> CSR로 변경
     **/
    componentDidMount() {
        // localStorage.clear()
        // console.log('componentDidMount')
        /**
         * GA initialize
         * 20180621.
         * */
        if(window.parent === window ){
            ReactGA.initialize('UA-33921198-11',{titleCase: false});
        }
        /**
         * Click Event로 변경요청
         * */
        // ga.PageView("proto_entry_page");
        ga.ClickEvent("proto_entry_page");

        const self = this

        let roundCode = ""
        let roundMin = ""
        let roundMax = ""
        let currYear = ""
        let roundListResult = ""
        let scheduleResult = ""
        let liveScore = ""
        let currentEventsData = ""

        /**
         * 20180605 by. Ckhong
         * onSale 중인 프로토 정보의 코드값을 가져온다.
         **/
        const dateObj = new Date()
        currYear = dateObj.getFullYear()

        const getRoundListUrl = publicRuntimeConfig.API_URL+'/round?type=PROTO_WIN&year='+currYear

        axios.get(getRoundListUrl, publicRuntimeConfig.REQ_HEADER)
            .then(function(response) {

                roundListResult = response.data.response

                response.data.response.forEach(function(protoInfo) {
                    if(protoInfo.onSale === true) {
                        roundCode = protoInfo.code
                    }
                })

                roundMin = roundListResult[0].code
                roundMax = roundListResult[roundListResult.length-1].code

                /**
                 * 20180605 by. CkHong
                 * onSale 중인 프로토정보의 스케줄 정보와 라운드(회차) 정보를 가져온다.
                 **/
                const getScheduleUrl = publicRuntimeConfig.API_URL+'/schedule?roundType=PROTO_WIN&roundCode='+ roundCode

                return axios.get(getScheduleUrl, publicRuntimeConfig.REQ_HEADER)
            }).then(function(response) {

            scheduleResult = response.data.response

            /**
             * 20180528 by. Ckhong
             * Proto JSON 데이터를 LiveScore 데이터로 UPDATE 하기 위해 LIVE SCORE(GateWay) 정보를 가져온다.
             **/
            const localTime = new Date()
            const fullDate = localTime.getFullYear()+"-"+(localTime.getMonth()+1)+"-"+localTime.getDate()
            const LIVE_SCORE_PARAMS = {
                date: fullDate,
                football_mode: "7m"
            }
            return axios.post(publicRuntimeConfig.LIVE_SCORE, qs.stringify(LIVE_SCORE_PARAMS), {
                header: publicRuntimeConfig.AJAX_HEADER
            })
        }).then(function(response) {

            try {
                liveScore = response.data.data

                // console.log(liveScore)

                currentEventsData = updateEventDataWithLiveScore(scheduleResult.events, liveScore)


                /**
                 *  20180618 by. CkHong
                 *  Sticky 메뉴를 구현하기 위한 Height 수치, CalcComp에 넘겨줌
                 * */
                const headerHeight = pageHeaderHeight;
                const rowsHeight = singleRowHeight * scheduleResult.events.length
                const tableHeight = headerHeight + rowsHeight

                /**
                 * LocalStorage
                 * */
                let calcLocalStorageData = getLocalStorage(roundCode)

                /**
                 * 20180605 by. CkHong
                 * CSR Initial Set State
                 **/
                self.setState({
                    scheduleData       : scheduleResult,
                    originEventsData   : scheduleResult.events,
                    currentEventsData  : currentEventsData,
                    roundData          : roundListResult,
                    roundCode          : roundCode,
                    roundMin           : roundMin,
                    roundMax           : roundMax,
                    currentSports      : "ALL",
                    currentYear        : currYear,
                    liveScore          : liveScore,
                    loadingFlag        : true,
                    calcEventList      : calcLocalStorageData.currentCalcEventList
                })

                /**
                 * 20180614 by. CkHong
                 * 데이터 갯수를 계산해서 iFrame 호출자에게 height 값을 미리 알려준다
                 * - Refresh했을때 스크롤바가 내려가게 함
                 * - 데이터 갯수에 따라 iFrame Height를 변동해줌
                 * */
                const footerHeight = pageFooterHeight + 40

                parent.window.postMessage( JSON.stringify({
                    method: "resize",
                    height: tableHeight + footerHeight,
                    src: location.href
                }), '*')


                /**
                 * 20180516 by. CkHong
                 * Listening to messages from WSS
                 */
                let pushSocket = new WebSocket(publicRuntimeConfig.WSS_URL);


                /**
                 * 20180516 by. CkHong
                 * Notify server which Topic client is interested in
                 */
                pushSocket.onopen = function (event) {
                    publicRuntimeConfig.SUB_LIST.forEach(function(topic) {
                        pushSocket.send(topic);
                    })
                };

                /**
                 * 20180516 by. CkHong
                 * Notify server which Topic client is interested in
                 */
                pushSocket.onmessage = function (event)
                {
                    if(event.data !== "OK") { // "OK" message가 아닌 push message일 경우
                        let pushData = JSON.parse(event.data)
                        if(pushData["TOPIC"] === "toto.event") {// 프로토 정보가 바꼈을때
                            let eventMessage = JSON.parse(pushData["MESSAGE"])
                            self.substituteData(eventMessage)
                        } else {
                            let eventMessage = pushData["MESSAGE"]
                            self.updateScoreData(eventMessage, pushData["TOPIC"])
                        }

                    }
                }

                pushSocket.onclose = function(event) {
                    console.log("Connection is closed")
                }

                pushSocket.onerror = function(error) {
                    console.error(error, arguments , "Socket Error")
                }

            } catch(e) {
              console.error(e)
            }

        }).catch((error) => {
            console.error(error)
        })

        /**
         * PollyFill
         * */
        createPolyFill()
    } // end componentDidMount

    componentDidUpdate() {
        parent.window.postMessage({
            cmd: 'protoDidMount',
        }, '*');
    }

    render() {

        if(this.state.loadingFlag) {
            return (
                <Layout>
                    <HeaderComp
                        ref           = "HeaderComp"
                        scheduleData  = {this.state.scheduleData}
                        roundData     = {this.state.roundData}
                        roundCode     = {this.state.roundCode}
                        roundMin      = {this.state.roundMin}
                        roundMax      = {this.state.roundMax}
                        currentSports = {this.state.currentSports}
                        currentYear   = {this.state.currentYear}
                        changeRound   = {this.changeRound}
                        switchSports  = {this.switchSports}
                        changeYear    = {this.changeYear}
                        isAbroad      = {this.state.isAbroad}
                        switchAbroad  = {this.switchAbroad}
                    />

                    <TableComp
                        ref            = "childTableComp"
                        roundCode      = {this.state.roundCode}
                        eventsData     = {this.state.currentEventsData}
                        currentSports  = {this.state.currentSports}
                        seqOrder       = {this.state.seqOrder}
                        changeSeqOrder = {this.changeSeqOrder}
                        isAbroad       = {this.state.isAbroad}
                        doMediate      = {this.doMediate}
                        calcMediate    = {this.calcMediate}
                        uncheckSeqNo   = {this.state.uncheckSeqNo}
                        calcEventList  = {this.state.calcEventList}
                        activeIndex    = {this.state.activeIndex}
                    />

                    <StickyMenuComp
                        ref                  = "childStickyMenuComp"
                        removeCalcCheckList  = {this.removeCalcCheckList}
                        updateTableCheckList = {this.updateTableCheckList}
                        eventsData           = {this.state.currentEventsData}
                        isAbroad             = {this.state.isAbroad}
                        roundCode            = {this.state.roundCode}
                        scrollToEvent        = {this.scrollToEvent}
                        calcEventList        = {this.state.calcEventList}
                    />
                </Layout>
            )

        } else {
            return(
                <Layout>
                    <div className="loader"></div>
                </Layout>
            )
        }
    }

}

export default Index