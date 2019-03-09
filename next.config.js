/**
 * 20180530 by CkHong
 * 환경변수 재설정
 */
let sub_name = "";         // sport.named.com/SUB_DOMAIN_NAME for recognising CSS, IMG folder
let api_req_info = {}      // API addre
let push_server_info = {}  // webpush addre
let live_score_url = ""
let date = new Date()
let queryTime = date.getTime()

/**
 * check if its bundle or local server configured in package.json
 */
const process_arg = process.argv[2]
if(process_arg != "dev") {sub_name = "/proto" }

/**
 * API addr && webpush addr
 */
if(process.env.NODE_ENV == 'production') { // 상용서버
    api_req_info = {
        api_name: '',
        api_key: '',
        api_url: ''
    }

    push_server_info = {
        wss_url: '',
    }

    live_score_url = ""

}

// stage server
// http://sports.nnamed.com/proto/
if (process.env.NODE_ENV == "beta") {
    api_req_info = {
        api_name: '',
        api_key: '',
        api_url: ''
    }

    push_server_info = {
        wss_url: '',
    }

    live_score_url = ""
    
}

// development mode
if (process.env.NODE_ENV == "development") {
    api_req_info = {
        api_name: '',
        api_key: '',
        api_url: ''
    }

    push_server_info = {
        wss_url: '',
    }

    live_score_url = ""
}

/**
 * webpush subscribe list
 */
push_server_info.subs_list = [ // Sub은 공통
    'SUB toto.event',
    'SUB named.score.web.football',
    'SUB named.score.web.baseball',
    'SUB named.score.volleyball',
    'SUB score.basketball.schedule',
]


module.exports = {

    assetPrefix: sub_name,

    webpack(config) {
        config.module.rules.push({
            test: /\.css$/,
            use: [ 'style-loader', 'css-loader' ]
        })
        return config;
    },

    publicRuntimeConfig: { // Will be available on BOTH server and client
        SUB_NAME: sub_name,
        QUERY_TIME: queryTime,
        API_NAME: api_req_info.api_name,
        API_KEY: api_req_info.api_key,
        API_URL: api_req_info.api_url,
        WSS_URL: push_server_info.wss_url,
        SUB_LIST: push_server_info.subs_list,
        LIVE_SCORE: live_score_url,
        PAGE_HEADER_HEIGHT: 253,
        TABLE_ROW_HEIGHT: 68,
        PAGE_FOOTER_HEIGHT: 94,
        REQ_HEADER: {
            headers:  {
                'api-name'    : api_req_info.api_name,
                'api-key'     : api_req_info.api_key,
                'contentType' : "application/json; charset=utf-8"
            },
            withCredentials : true
        },
        AJAX_HEADER: {
            "Access-Control-Allow-Origin"  : "*",
            "Access-Control-Allow-Methods" : "GET,POST,PUT,DELETE,OPTIONS",
            "Access-Control-Allow-Headers" : "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With"
        }
    } // end publicRuntimeConfig

}
