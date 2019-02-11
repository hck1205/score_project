import {Component} from 'react'
import Odd from './oddComp'
import Option from './optionComp'
import UnoverScore from './unoverScoreComp'
import GameStatus from './gameStatus'
import {getFormatDate} from "../static/js/common_help"
import {
    getGameImage,
    getNameOfEventType,
    getGameResult,
    getResultColor,
    getHomeScore,
    getAwayScore,
    getScoreColor,
} from "../static/js/event_help";



class EventComp extends Component {
    constructor(props) {
        super(props)
    }

    /**
     * 해외배당률 또는 국내배당률로 식별하여 데이터 추출
     * */
    getOddsArr() {
        let oddsArr = []

        if(this.props.isAbroad) {
            oddsArr = this.props.event.globalOdds
        } else {
            oddsArr = this.props.event.odds
        }

        return oddsArr
    }

    componentWillReceiveProps(nextProps) {
        // console.log("componentWillReceiveProps")
        // if(Object.keys(nextProps.calcEvent).length!= 0) {
        //     console.log(this.props.calcEvent)
        // }
        // console.log(this.props.eventIndex)
    }

    render() {


        const oddsArr = this.getOddsArr()
        return (
            <tr>
                <th className="seqNum">
                    {this.props.event.odds.length > 1 ?
                        <div className="oddsToolTipBox"
                             title="국내 배당률 변경 내역"
                             onClick={(e) => this.props.showPopup(this.props.event, e, this.props.eventIndex)}>!</div>
                        : ""
                    }
                    <div>{this.props.event.seq}</div>
                </th>
                <td className="leagueName">
                    {getGameImage(this.props.event.sports)}
                    <div title="대회명">{this.props.event.league}</div>
                </td>
                <td className="eventDateTd">
                    <span title="경기일시">
                        {getFormatDate(this.props.event.startAt).date}
                    </span>
                    <div title="경기시간">
                        {getFormatDate(this.props.event.startAt).time}
                    </div>
                </td>
                <td className="eventTypeTd">
                    <div className="eventType"
                         title="게임유형">
                        {getNameOfEventType(this.props.event.odds[0].type)}
                    </div>
                    <Option key={this.props.event.id}
                            oddsArr={oddsArr}
                    />
                </td>
                <td>
                    <div className="gameScoreContainer">
                        <div className="homeTeam" title="홈팀">
                            {this.props.event.homeTeam}
                            <UnoverScore key   = {this.props.event.id}
                                         event = {this.props.event}
                                         odds  = {oddsArr}
                            />
                        </div>

                        {this.props.event.score !== null ?
                            <div className={"homeTeamScore " + getScoreColor(this.props.event, "home")}
                                 title="홈 스코어">
                                {getHomeScore(this.props.event)}
                            </div> : <div className="homeTeamScore">-</div>
                        }

                        <div className="gameStatusContainer">
                            <div className={"gameResult "+ getResultColor(getGameResult(this.props.event))}
                                 title="경기상태">
                                {getGameResult(this.props.event)}
                            </div>
                            <div className="gameStatus">
                                <GameStatus
                                    event={this.props.event}
                                />
                            </div>
                        </div>

                        {this.props.event.score !== null ?
                            <div className={"awayTeamScore " + getScoreColor(this.props.event, "away")}
                                 title="원정 스코어">
                                {getAwayScore(this.props.event)}
                            </div> : <div className="awayTeamScore">-</div>
                        }

                        <div className="awayTeam" title="원정팀">
                            {this.props.event.awayTeam}
                        </div>
                    </div>
                </td>
                <td>
                    {
                        <Odd oddsArr        = {oddsArr}
                             oddsDomestic   = {this.props.event.odds}
                             eventStatus    = {this.props.event.status}
                             eventsData     = {this.props.eventsData}
                             isAbroad       = {this.props.isAbroad}
                             event          = {this.props.event}
                             doMediate      = {this.props.doMediate}
                             calcMediate    = {this.props.calcMediate}
                             uncheckSeqNo   = {this.props.uncheckSeqNo}
                             calcEvent      = {this.props.calcEvent}
                             calcEventList  = {this.props.calcEventList}
                             activeIndex    = {this.props.activeIndex}
                             updateCalcTableCheckStatus = {this.props.updateCalcTableCheckStatus}
                        />
                    }
                </td>
            </tr>
        )
    }
}

export default EventComp