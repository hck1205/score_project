import {Component} from "react";

class SoccerTimer extends Component {

    constructor(props) {
        super(props)

        this.state = {
            diffTime: "",
            displayTime: ""
        }

    }

    getLocalTime() {

        let now = new Date();
        let timeZone = now.getTime() + (now.getTimezoneOffset() * 60000) + (9 * 3600000); // + 9 = 한국표준시
        now.setTime(timeZone);

        let timeFormat =
            this.leadingZeros(now.getMonth() + 1, 2) + '/' +
            this.leadingZeros(now.getDate(), 2) + '/' +
            this.leadingZeros(now.getFullYear(), 4) + ' ' +

            this.leadingZeros(now.getHours(), 2) + ':' +
            this.leadingZeros(now.getMinutes(), 2) + ':' +
            this.leadingZeros(now.getSeconds(), 2);

        return timeFormat;
    }

    leadingZeros(n, digits) {
        let zero = '';
        n = n.toString();

        if (n.length < digits) {
            for (let i = 0; i < digits - n.length; i++)
                zero += '0';
        }
        return zero + n;
    }

    getPlayTimeIfPlaying() {

        // console.log('getPlayTimeIfPlaying')

        let event = this.props.event
        let diffTime = this.state.diffTime
        let displayTime = 0

        if (event.gstatus == 1 || event.gstatus == 3) { // 전반전(1):후반전(3)
            diffTime += 1000 // 1초씩 증가
            displayTime = parseInt(diffTime / (1000 * 60)) // seconds * minutes

            if(event.gstatus == 1 && displayTime > 45) {
                displayTime = 45
            } else if (event.gstatus == 3 && displayTime > 90) {
                displayTime = 90
            }

            this.setState({
                displayTime: displayTime+"'",
                diffTime: diffTime
            })

        } else {
            this.setState({
                displayTime: ""
            })
        }
    }


    componentDidMount() {

        let event = this.props.event
        let eventStatus = ["DONE","CANCEL","READY","HOLD","DELAY"]

        let seoulTime = this.getLocalTime()
        let localTime = new Date(seoulTime)
        let diffTime = 0

        if(eventStatus.indexOf(event.status) > -1) { // 경기중이 아니라면
            clearInterval(this.state.interval)
            return
        } else { // 경기중이라면

            if(event.hasOwnProperty('startTime')) {

                let startTime = new Date(event.startTime)
                let milliSeconds = startTime.getTime()

                if(event.gstatus == 1) { // 전반전(1):후반전(3)
                    milliSeconds = startTime.getTime() + 3600000
                } else if(event.gstatus == 3) {
                    milliSeconds = startTime.getTime() + 3600000 - 2700000
                }

                startTime = new Date(milliSeconds)
                diffTime = localTime - startTime
            } else {
                diffTime = 0
            }

            this.setState({
                interval: setInterval(this.getPlayTimeIfPlaying.bind(this), 1000),
                diffTime: diffTime
            })

        }
    }

    /**
     * 20180619. by CkHong.
     * 메시지로 축구시간이 새로 왔을때 Interval 교체해준다.
     * */
    componentWillReceiveProps(nextProps) {

        let event = this.props.event
        let eventStatus = ["DONE","CANCEL","READY","HOLD","DELAY"]

        let seoulTime = this.getLocalTime()
        let localTime = new Date(seoulTime)
        let diffTime = 0

        if(eventStatus.indexOf(event.status) > -1) { // 경기중이 아니라면
            clearInterval(this.state.interval)
            return
        } else { // 경기중이라면

            if(event.hasOwnProperty('startTime')) {

                let startTime = new Date(event.startTime)
                let milliSeconds = startTime.getTime()

                if(event.gstatus == 1) { // 전반전(1):후반전(3)
                    milliSeconds = startTime.getTime() + 3600000
                } else if(event.gstatus == 3) {
                    milliSeconds = startTime.getTime() + 3600000 - 2700000
                }

                startTime = new Date(milliSeconds)
                diffTime = localTime - startTime
            } else {
                diffTime = 0
            }

            this.setState({
                diffTime: diffTime
            })
        }
    }

    componentWillUnmount() {
        clearInterval(this.state.interval)
        this.setState({
            displayTime: "",
            diffTime: ""
        })
    }

    render() {

        return(
            <div>
                {this.state.displayTime}
            </div>
        )
    }
}

export default SoccerTimer