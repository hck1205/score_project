import {Component} from "react";

class OddPopup extends Component {

    constructor(props) {
        super(props)
    }

    reverseOdds(odds) {
        let reverseOdds = [];

        // 첫번째 배당율 변경 내역은 확인 하지 않는다: i >= 1;
        for(let i = odds.length-1; i >= 1; i--) {
            reverseOdds.push(odds[i])
        }

        return reverseOdds
    }

    updateStyle(offsetTop) {
        const popupStyle = {
            top: 0,
            left: this.props.offsetLeft-18
        }
        let countEvents = this.props.countEvents
        let index = this.props.index

        if(countEvents - index <= 5) {
            popupStyle.top = offsetTop - 270
        } else {
            popupStyle.top = offsetTop + 40
        }

        return popupStyle
    }

    getFormatDate(startAt) {

        let formatDate = ""

        let now = new Date(startAt)

        let d = this.checkTime(now.getDate())
        let m = this.checkTime(now.getMonth() + 1)
        let yy = now.getFullYear()
        let hh = this.checkTime(now.getHours()) //24 Hours
        let mm = this.checkTime(now.getMinutes())

        let dayOfWeek = ["(일)", "(월)", "(화)", "(수)", "(목)", "(금)", "(토)"]

        //YYYY-MM-DD HH:mm

        formatDate = yy + "-" + m + "-" + d + " " + hh + ":" + mm

        return formatDate
    }

    checkTime(i) {
        if (i < 10) {i = "0" + i};  // add zero in front of numbers < 10
        return i;
    }

    getOptionsText(odd) {
        if(odd.type == "HANDICAP") {
            return "핸디:"
        } else if (odd.type == "UNOVER"){
            return "U/O:"
        }
    }

    isUnover(odd) {
        if(odd.type == "UNOVER") {
            return true
        } else {
            return false
        }
    }

    isOptionChange(odd) {
        let isChange = false
        if(odd.options != odd.preOptions) {
            isChange = true
        }
        return isChange
    }

    convertToZero(val) {
        if(val == "-") {
            return 0
        } else {
            return val
        }
    }

    render() {
        return(
            <div className="popupContainer" style={this.updateStyle(this.props.offsetTop)}>
                <div className="popupHeader">
                    <div className="popupSeqNo">{this.props.event.seq}</div>
                    <div className="popupTeamTitle">{this.props.event.homeTeam} vs {this.props.event.awayTeam}</div>
                    <div className="popupCloseBtn" onClick={this.props.hidePopup}></div>
                </div>


                <div className="popupBody">
                    {
                        this.reverseOdds(this.props.event.odds).map((odd) => (
                            <div className="popupOddElement" key={odd.seq}>
                                <div className="popupBodyHeader">
                                    {odd.seq-1}차변경
                                    <div className="oddCreatedAt">
                                        {this.getFormatDate(odd.createAt)}
                                    </div>
                                </div>
                                <br />

                                {this.isOptionChange(odd) ? <div className="oddOptions">{this.getOptionsText(odd)}</div> : ""}
                                {this.isOptionChange(odd) ? <div className="odd">{this.convertToZero(odd.preOptions)} -> {this.convertToZero(odd.options)}</div> : ""}
                                {this.isOptionChange(odd) ? <br /> : ""}

                                <div className="oddWin">{this.isUnover(odd) ? "U:":"승:"}</div>
                                <div className="odd">{this.convertToZero(odd.preOneRate)} -> {this.convertToZero(odd.oneRate)}</div>
                                <br />

                                {odd.preXRate !== "-" ? <div className="oddDraw">무:</div>: ""}
                                {odd.preXRate !== "-" ? <div className="odd">{this.convertToZero(odd.preXRate)} -> {this.convertToZero(odd.xrate)}</div> : ""}
                                {odd.preXRate !== "-" ? <br /> : ""}

                                <div className="oddLost">{this.isUnover(odd) ? "O:":"패:"}</div>
                                <div className="odd">{this.convertToZero(odd.preTwoRate)} -> {this.convertToZero(odd.twoRate)}</div>
                            </div>
                        ))
                    }
                </div>
            </div>
        )
    }
}

export default OddPopup