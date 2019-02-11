import {Component} from 'react'
import Event from './eventComp'
import OddPopup from './oddPopup'
import ga from "./GAModule";
import ReactDOM from "react-dom";
import getConfig from "next/config"

const {publicRuntimeConfig} = getConfig()

const pageHeaderHeight = publicRuntimeConfig.PAGE_HEADER_HEIGHT
const singleRowHeight = publicRuntimeConfig.TABLE_ROW_HEIGHT
const pageFooterHeight = publicRuntimeConfig.PAGE_FOOTER_HEIGHT

class TableComp extends Component {

    constructor(props) {
        super(props)

        this.state = {
            isPopupVisible: false,
            event: {},
            offsetTop: 0,
            offsetLeft: 0,
            countEvents: 0,
            index: 0,
        }

        this.showPopup = this.showPopup.bind(this)
        this.hidePopup = this.hidePopup.bind(this)
    }


    /**
     * 20180518 by. CkHong
     * 선택한 Row의 위치의 따라 팝업창의 위치를 변경하기 위해
     * offsetY, countEvents, index 값이 필요
     */
    showPopup(selectedEvent, e, index) {

        // console.log('showPopup')
        /**
         * 20180612. GA 라벨링
         * */
        let gaLabel = "proto_show_odd_popup"
        ga.ClickEvent(gaLabel)

        this.setState({
            isPopupVisible: true,
            event: selectedEvent,
            offsetTop: e.target.offsetTop,
            offsetLeft: e.target.offsetLeft,
            countEvents: this.props.eventsData.length,
            index: index
        })
    }

    hidePopup() {

        // console.log('hidePopup')

        this.setState({
            isPopupVisible: false,
            eventSeqNum: 0,
        })
    }

    findMatchedCalcEvent(eventSeq) {
        // localStorage.clear(); // 전체 삭제

        let calcEventList = this.props.calcEventList
        let matchedEvent = {}

        if(calcEventList.length > 0) {
            calcEventList.forEach(function(calcEvent, i) {
                if(calcEvent.seq == eventSeq) {
                    matchedEvent = calcEvent
                }
            })
        }

        return matchedEvent
    }

    scrollToEvent(seq) {

        let eventSeq = "eventSeq_"+seq
        let eventElement = ReactDOM.findDOMNode(this.refs[eventSeq])
        let calcExpandMenu = document.getElementById("calcExpandMenu")

        // let bodyRect = document.body.getBoundingClientRect().top
        // let windowHeight = screen.height - window.innerHeight
        // let scrollTo = offSetTopFromViewPort + Math.abs(bodyRect) + windowHeight


        /**
         * NAMED-9948
         * [PW] 프로토 > 계산기 > 경기 클릭시 포커싱 기능 수정
         * */
        if(window.parent != self) { // 부모창이 있을때
            if(eventElement) {
                eventElement.scrollIntoView(false);

                let calcExpandMenuHeight = 340

                parent.window.postMessage({
                    cmd: 'protoScrollIntoView',
                    value: calcExpandMenuHeight
                }, '*');
            }
        } else {
            if(eventElement) {
                eventElement.scrollIntoView(true);
                let offsetFromCalcMenu = calcExpandMenu.getBoundingClientRect().top * -1
                window.scrollBy(0, offsetFromCalcMenu + singleRowHeight)
            }
        }
    }

    getSportName() {
        let sports = this.props.currentSports
        let sportsName = ""

        switch(sports) {
            case "SOCCER":
                sportsName = "축구"
                break;
            case "BASEBALL":
                sportsName = "야구"
                break;

            case "BASKETBALL":
                sportsName = "농구"
                break;

            case "VOLLEYBALL":
                sportsName = "배구"
                break;
            default:
                sportsName = "전체"
        }

        return sportsName
    }

    getIconName() {
        let sports = this.props.currentSports
        return sports.toLowerCase()
    }

    componentWillReceiveProps(nextProps) {
        // console.log(nextProps)
    }

    componentDidUpdate() {
        /**
         * NAMED-9949
         * [PW] 프로토 > 계산기 > 경기 추가시 스크롤이 하단 이동되도록 수정 요청
         * */
        let calcTableBody = document.getElementById("calcTableBody")
        if(calcTableBody.clientHeight < calcTableBody.scrollHeight) {
            calcTableBody.scrollTop = calcTableBody.scrollHeight - calcTableBody.clientHeight
        }

    }

    render() {

        const oddPopup = (this.state.isPopupVisible ?
                <OddPopup hidePopup={this.hidePopup}
                          event={this.state.event}
                          offsetTop={this.state.offsetTop}
                          offsetLeft={this.state.offsetLeft}
                          countEvents={this.state.countEvents}
                          index={this.state.index}
                /> : null
        )

        return (
            <div className="indexContainer" align="center">
                {oddPopup}
                <table className="eventTable">
                <tbody>
                    <tr className="tableHeader">
                        <td className="numberTh">번호
                            <button
                                className="seqButton"
                                title="번호순서변경"
                                onClick={this.props.changeSeqOrder}>
                                <div className={this.props.seqOrder}></div>
                            </button>
                        </td>
                        <td>대회명</td>
                        <td>경기일시</td>
                        <td>유형</td>
                        <td>홈팀 vs 원정팀</td>
                        <td className="thRate">배당률</td>
                    </tr>
                    {
                        this.props.eventsData.map((event, index) => (
                            <Event key           = {index}
                                   event         = {event}
                                   eventIndex    = {event.seq}
                                   eventsData    = {this.props.eventsData}
                                   countEvents   = {this.props.eventsData.length}
                                   showPopup     = {this.showPopup}
                                   hidePopup     = {this.hidePopup}
                                   isAbroad      = {this.props.isAbroad}
                                   doMediate     = {this.props.doMediate}
                                   calcMediate   = {this.props.calcMediate}
                                   uncheckSeqNo  = {this.props.uncheckSeqNo}
                                   calcEvent     = {this.findMatchedCalcEvent(event.seq)}
                                   calcEventList = {this.props.calcEventList}
                                   activeIndex   = {this.props.activeIndex}
                                   ref           = {"eventSeq_"+event.seq}
                            />
                        ))
                    }
                </tbody>
                </table>
                {
                    this.props.eventsData.length == 0 ?
                        <div className={"emptyProtoContainer"}>
                            <div className={"emptyProtoImageWrapper"}>
                                <img className={"emptyProtoImage "+this.getIconName()} src={`${publicRuntimeConfig.SUB_NAME}/static/img/proto_icon.jpg`} />
                            </div>
                            <div className={"emptyProtoMessageTypeA"}>해당 프로토 회차에는 {this.getSportName()} 대상 경기가 없습니다.</div>
                            <div className={"emptyProtoMessageTypeB"}>전체를 클릭하시면 다른 종목의 프로토 경기를 확인 하실수 있습니다.</div>
                        </div> :
                        <div></div>
                }
            </div>
        )
    }
}

export default TableComp
