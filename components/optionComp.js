import {Component} from "react";

class OptionComp extends Component {

    constructor(props) {
        super(props)
    }

    getLatestOdd() {
        let latestOdd = {}
        let oddsArr = this.props.oddsArr

        if(typeof oddsArr == "object") {
            this.props.oddsArr.forEach(function(odd) {
                if(odd.latest === true) {
                    latestOdd = odd
                }
            })
            return latestOdd
        }

    }

    getGameType(odd) {
        if(odd.type === "UNOVER") {
            return "U"
        } else if(odd.type === "HANDICAP") {
            return "H"
        } else {
            return ""
        }

    }

    getArrow(odd) {
        if(odd.options > odd.diffOptions) {
            return "optionArrowUp"
        } else if(odd.options < odd.diffOptions) {
            return "optionArrowDown"
        } else {

            return ""
        }
    }


    render() {

        const latestOdd = this.getLatestOdd()

        return(
            <div className="optionContainer" title="옵션점수">
                {
                    this.getGameType(latestOdd)
                }
                <div className="optionValue">
                    {
                        latestOdd.type != "WIN" ? parseFloat(latestOdd.options).toFixed(1) : ""
                    }
                </div>
                <div className="optionArrowContainer">
                    <div className={this.getArrow(latestOdd)}></div>
                </div>
            </div>
        )
    }
}

export default OptionComp