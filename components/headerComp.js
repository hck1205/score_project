import {Component} from "react";
import {BrowserView, MobileView, isBrowser, isMobile, isIOS, isAndroid } from "react-device-detect";
import getConfig from 'next/config'
import AdSense from './adSense'
const {publicRuntimeConfig} = getConfig()

class HeaderComp extends Component {

    constructor(props) {

        super(props)

        this.state = {
            defaultRoundCode: this.props.roundCode
        }

    }

    // getDefaultRoundValue() {
    //
    //     let defaultCode = "";
    //     let lastElementIndex = this.props.roundData.length - 1;
    //
    //     this.props.roundData.forEach(function(round) {
    //         if (round.onSale) {
    //             defaultCode = round.code
    //         }
    //     })
    //
    //     if(defaultCode === "") {
    //         defaultCode = this.props.roundData[lastElementIndex].code
    //     }
    //
    //     return defaultCode
    // }


    getCurrentSports(sportsName) {


        let currentSports = this.props.currentSports

        if(currentSports === sportsName) {
            return " sportsName-active"
        } else {
            return ""
        }
    }

    getFormatDate(startAt) {

        let formatDate = {
            date: "",
            time: ""
        }


        let now = new Date(startAt)

        let d = this.checkTime(now.getDate())
        let m = this.checkTime(now.getMonth() + 1)
        let yy = now.getFullYear()
        let hh = this.checkTime(now.getHours()) //24 Hours
        let mm = this.checkTime(now.getMinutes())

        let dayOfWeek = ["(일)", "(월)", "(화)", "(수)", "(목)", "(금)", "(토)"]

        //YYYY-MM-DD HH:mm
        formatDate.date = yy + "-" + m + "-" + d + " " + hh + ":" + mm
        formatDate.time = hh + ":" + mm

        return formatDate
    }

    checkTime(i) {
        if (i < 10) {i = "0" + i};  // add zero in front of numbers < 10
        return i;
    }

    getMaxYear() {
        const dateObj = new Date()
        const currYear = dateObj.getFullYear()

        if(this.props.currentYear == currYear) {
            return "maxYear"
        } else {
            return ""
        }
    }

    getMinYear() {
        if(this.props.currentYear == "2014") {
            return "minYear"
        } else {
            return ""
        }
    }

    setDefaultValue() {
        let roundData = this.props.roundData
        let length = this.props.roundData.length - 1
        let index = 0

        roundData.some(function(round, i) {
            if(round.onSale) {
                index = i
                return true
            }
        })

        if(index != 0) {
            index = length - index
        }

        let selectTag = document.getElementById("roundSelect")

        if(selectTag != null) {
            selectTag.selectedIndex = index
        }
    }

    setRoundValue(isIncrease) {
        let roundElement = document.getElementById("roundSelect")
        let btnElement = document.getElementById("incRoundBtn")
        let selectedIndex = roundElement.selectedIndex
        let roundLength = roundElement.options.length

        if(isIncrease) {
            if(selectedIndex > 0) {
                roundElement.selectedIndex = selectedIndex - 1
            }
        } else {
            if(selectedIndex + 1  < roundLength) {
                roundElement.selectedIndex = selectedIndex + 1
            }

        }

    }

    getMinRound() {
        let roundMin = this.props.roundMin
        let btnElement = document.getElementById("descRoundBtn")
        let selectElement = document.getElementById("roundSelect")

        if(btnElement != null && selectElement != null) {
            if(selectElement.value == roundMin) {
                btnElement.disabled = "disabled"
                return "minRound"
            } else {
                btnElement.disabled = ""
                return ""
            }
        }

        return ""
    }

    getMaxRound() {
        let roundMax = this.props.roundMax
        let btnElement = document.getElementById("incRoundBtn")
        let selectElement = document.getElementById("roundSelect")


        if(btnElement != null && selectElement != null) {

            if(parseInt(selectElement.value) == parseInt(roundMax)) {
                btnElement.disabled = "disabled"
                return "maxRound"
            } else {
                btnElement.disabled = ""
                return ""
            }
        }

        return ""
    }

    setRoundChangeBtnClass() {
        let roundMax = this.props.roundMax
        let btnElement = document.getElementById("incRoundBtn")
        let selectElement = document.getElementById("roundSelect")

        if(btnElement != null && selectElement != null) {
            if(parseInt(selectElement.value) == parseInt(roundMax)) {
                btnElement.disabled = "disabled"
                btnElement.childNodes[0].classList.add("maxRound")
            }
        }
    }

    /**
     * 최초 페이지 로딩시 필요
     * */

    componentDidMount() {
        this.setRoundChangeBtnClass()
    }

    /**
     * 연도 변경시 필요
     * */
    componentDidUpdate() {
        this.setRoundChangeBtnClass()
    }


    render() {

        const sub_name = publicRuntimeConfig.SUB_NAME

        return (
            <div className="headerContainer">
                <div className="menuContainer">
                    <div className="mainMenu">
                        <div className="menuTitle">프로토정보</div>
                        <div className="subMenuTitle status">승부식</div>
                    </div>

                    <div className="subMenu">
                        <a className={"sportsName" + this.getCurrentSports('ALL')}
                           title="전체종목"
                           onClick={()=>this.props.switchSports("ALL")}>전체</a>
                        <div className="splitBar"></div>

                        <a className={"sportsName" + this.getCurrentSports('SOCCER')}
                           title="축구"
                           onClick={()=>this.props.switchSports('SOCCER')}>축구</a>
                        <div className="splitBar"></div>

                        <a className={"sportsName" + this.getCurrentSports('BASEBALL')}
                           title="야구"
                           onClick={()=>this.props.switchSports('BASEBALL')}>야구</a>
                        <div className="splitBar"></div>

                        <a className={"sportsName" + this.getCurrentSports('BASKETBALL')}
                           title="농구"
                           onClick={()=>this.props.switchSports('BASKETBALL')}>농구</a>
                        <div className="splitBar"></div>

                        <a className={"sportsName" + this.getCurrentSports('VOLLEYBALL')}
                           title="배구"
                           onClick={()=>this.props.switchSports('VOLLEYBALL')}>배구</a>

                        <div className="protoIssueDateContainer">
                            <div className="dot"></div>
                            <span>발매기간:</span>
                            {this.getFormatDate(this.props.scheduleData.startAt).date + " "}
                            ~ 경기별 10분전 발매마감
                        </div>
                    </div>
                </div>

                <div className="bannerContainer">
                    <div>
                        <AdSense />
                        <a className="linkContainer" href={"http://nsports.kr/"} target="_blank">
                            <img src="https://image.named.com/score_web/banner/sports_app_banner.png" />
                        </a>
                    </div>
                </div>

                <div className="subHeader">
                    <div className="scheduleYearContainer">
                        <button className="yearChangeBtn"
                                onClick={()=>this.props.changeYear(false)}
                                title="연도변경">
                            <i className={"yearBtnLeft " + this.getMinYear()}></i>
                        </button>

                        <div className="scheduleYear">
                            {this.props.currentYear}
                        </div>

                        <button className={"yearChangeBtn "}
                                onClick={()=>this.props.changeYear(true)}
                                title="연도변경">
                            <i className={"yearBtnRight " + this.getMaxYear()}></i>
                        </button>
                    </div>
                    <div className="yearText">년</div>

                    {/*<div className="selectContainer" style={{backgroundImage: "url("+sub_name+"/static/img/arrowDown.png)"}}>*/}

                    <button className={"roundChangeBtnLeft"}
                            onClick={
                                (e) => {
                                    this.props.changeRound(e, false)
                                    this.setRoundValue(false)
                                }
                            }
                            title="회차변경"
                            id={"descRoundBtn"}>
                        <i className={"roundBtnLeft " + this.getMinRound()}></i>
                    </button>
                    <div className="selectContainer">
                        <select className="roundSelect"
                                defaultValue={this.state.defaultRoundCode}
                                onChange={this.props.changeRound}
                                title="회차변경"
                                id={"roundSelect"}>
                            {
                                this.props.roundData.slice().reverse().map((round, index) => (
                                    <option key={round.code}
                                            value={round.code}>{round.seq}</option>
                                ))
                            }
                        </select>
                    </div>
                    <button className={"roundChangeBtnRight"}
                            onClick={
                                (e) => {
                                    this.props.changeRound(e, true)
                                    this.setRoundValue(true)
                                }
                            }
                            title="회차변경"
                            id={"incRoundBtn"}>
                        <i className={"roundBtnRight " + this.getMaxRound()}></i>
                    </button>
                    <div className="roundText">회차</div>

                    <div className="switchOddBtnContainer">
                        {
                            this.props.isAbroad ?
                                <button
                                    className="oddBtn"
                                    title="국내 배당률"
                                    onClick={() => this.props.switchAbroad(false)}>국내 배당률</button> :
                                <button
                                    className="oddBtn oddBtn-active"
                                    title="국내 배당률">국내 배당률</button>
                        }
                        {
                            this.props.isAbroad ?
                                <button
                                    className="oddBtn oddBtn-active"
                                    title="해외 배당률">해외 배당률</button> :
                                <button
                                    className="oddBtn"
                                    title="해외 배당률"
                                    onClick={() => this.props.switchAbroad(true)}>해외 배당률</button>
                        }
                    </div>
                </div>
            </div>
        )
    }
}

export default HeaderComp
