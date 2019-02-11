import {Component} from "react";

class UnoverScoreComp extends Component {

    constructor(props) {
        super(props)
    }

    getLatestOdd() {
        let latestOdd = {}
        this.props.event.odds.forEach(function(odd) {
            if(odd.latest === true) {
                latestOdd = odd
            }
        })

        return latestOdd
    }

    getSumOfScore(event) {

        if(event.sports == "VOLLEYBALL") {

            let overAllHomeScore = 0
            let overAllAwayScore = 0

            if(event.score.hasOwnProperty("overAllHomeScore")) {
                if(event.score.overAllHomeScore != "") {
                    overAllHomeScore = parseInt(event.score.overAllHomeScore)
                }
            } else {
                overAllHomeScore = parseInt(event.score.home)
            }

            if(event.score.hasOwnProperty("overAllAwayScore")) {
                if(event.score.overAllAwayScore != "") {
                    overAllAwayScore = parseInt(event.score.overAllAwayScore)
                }
            } else {
                overAllAwayScore = parseInt(event.score.away)
            }

            return overAllHomeScore + overAllAwayScore

        } else { // 배구경기가 아니라면
            if(event.score != null) {
                if(event.score.hasOwnProperty("home")) {
                    if(event.score.home == null || event.score.home == "" || event.score.home == undefined || event.score.home == "-") {
                        event.score.home = 0
                    }
                }

                if(event.score.hasOwnProperty("away")) {
                    if(event.score.away == null || event.score.away == "" || event.score.away == undefined || event.score.away == "-") {
                        event.score.awawy = 0
                    }
                }

                return parseInt(event.score.home) + parseInt(event.score.away)
            }
        }
    }

    chkIfScoreExist() { // 스코어 점수가 존재하고 점수타입이 Number라면 Unover 점수를 표기
        let score = this.props.event.score
        let chkFlag = false

        if(score != null || score != undefined) {
            if(score.hasOwnProperty("home") && score.hasOwnProperty("away")) {
                if(typeof parseInt(score.home) == "number" && typeof parseInt(score.away) == "number") {
                    chkFlag = true
                }
            }
        }

        return chkFlag
    }

    render() {

        const latestOdd = this.getLatestOdd()

        return(
            <div title="언오버 점수">
                {
                    latestOdd.type === "UNOVER" && this.chkIfScoreExist() ?
                        <div className="unoverScoreTotal">합</div> : ""
                }
                {
                    latestOdd.type === "UNOVER" && this.chkIfScoreExist() ?
                        <div className="unoverScore">{this.getSumOfScore(this.props.event)}점</div> : ""
                }
            </div>
        )
    }
}

export default UnoverScoreComp