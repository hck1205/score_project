import {Component} from "react"

class AdSense extends Component {

    constructor(props) {
        super(props)
    }


    componentDidMount(){
        try {
            (adsbygoogle = window.adsbygoogle || []).push({});
        } catch (e) {
            setTimeout(function(){
                (adsbygoogle = window.adsbygoogle || []).push({});
            }.bind(this), 3000);
        }
    }

    render() {

        return(
            <div className="adSenseContainer">
                <ins className="adsbygoogle"
                     data-ad-client="ca-pub-1874524243460406"
                     data-ad-slot="4257878173"></ins>
            </div>
        )
    }
}

export default AdSense