import ReactGA from 'react-ga';

/**
 * Created by dhjang on 2017-10-26
 */
const GAModule = {
    ClickEvent : (label, category = "livescore", action = "click") => {
        if(parent.window === window){
            ReactGA.event({
                category: category,
                action: action,
                label : label
            });
        }else{
            const data = {
                method : 'scoreClickEvent',
                category: category,
                action: action,
                label : label
            };
            parent.postMessage( JSON.stringify( data ), '*');
        }
    },
    PageView : (pageName) => {
        if(parent.window === window){
            ReactGA.pageview(pageName);
        }else{
            const data = {
                method : 'scorePageView',
                pageName: pageName
            };
            parent.postMessage( JSON.stringify( data ), '*');
        }
    }
};

export default GAModule;