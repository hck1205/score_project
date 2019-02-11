import {Component} from "react"
import SoccerTimer from './soccerTimer'

class GameStatus extends Component {

    constructor(props) {
        super(props)

        this.state = {
            event: this.props.event,
            isMounted: false
        }

        this.SoccerTimer = React.createRef();
    }


    getGameStatus(event) {

        let status = "";

        if(event.sports == "BASKETBALL" && event.status == "PLAYING") {
            //경기 남은 시간
            return event.displayTime
        }

        if(event.sports == "VOLLEYBALL" && event.status == "PLAYING") {
            // return event.quotaHomeScore + ":" + event.quotaAwayScore

            //현재 세트 스코어 -> 20180607. 현재 세트 상세스코어로 변경됨
            let homeScore = 0
            let awayScore = 0

            if(event.score == undefined) return homeScore + ":" + awayScore

            if(event.score.home == null || event.score.home == undefined) {
                event.score.currentHomeScore = homeScore
            }
            if(event.score.away == null || event.score.away == undefined) {
                event.score.currentAwayScore = awayScore
            }

            return event.score.currentHomeScore + ":" + event.score.currentAwayScore
        }

        if(event.sports == "SOCCER" && event.status == "PLAYING") {

            //축구 경기 시간
            let timerComp = <SoccerTimer
                                event = {this.props.event}
                                ref   = {"soccerTimer-"+this.props.event.id} />

            return timerComp

        } else {
            switch (event.status) {
                case "DONE":
                    status = "종료"
                    break;
                case "CANCEL":
                    status = "" // 경기 상태 값에 취소가 이미 들어가있다.
                    break;
                case "READY":
                    status = "경기전"
                    break;
                case "HOLD":
                    status = "중단"
                    break;
                case "PLAYING":
                    status = "경기중"
                    break;
                default:
                    status = "지연"
                    break;
            }
        }

        return status
    }

    render() {

        const gameStatus = this.getGameStatus(this.props.event)

        return(
            <div>
                {gameStatus}
            </div>
        )
    }
}

export default GameStatus