/**
 * 20180530 by CkHong
 * 환경변수 재설정
 */
let sub_name = "";         // sport.named.com/SUB_DOMAIN_NAME에 들어갈 변수: CSS, IMG등 폴더 인식을 위해 필요함
let api_req_info = {}      // API 주소
let push_server_info = {}  // 웹푸시 주소
let live_score_url = ""
let date = new Date()
let queryTime = date.getTime()

/**
 * bundle인지 로컬 서버인지 확인 package.json에 설정
 */
const process_arg = process.argv[2]
if(process_arg != "dev") {sub_name = "/proto" }

/**
 * API 주소 && 웹푸시 주소
 */
if(process.env.NODE_ENV == 'production') { // 상용서버
    api_req_info = {
        api_name: 'named_pc',
        api_key: 'rbvLq2Ah5wBl',
        api_url: 'https://api.named.com/toto/v1'
    }

    push_server_info = {
        wss_url: 'wss://push.named.com:443/sub',
    }

    live_score_url = "https://sports.named.com/gateway/livegames/live_schedule_gateway.php"

}

// 스테이지 서버
// http://sports.nnamed.com/proto/
if (process.env.NODE_ENV == "beta") {
    api_req_info = {
        api_name: 'named_pc',
        api_key: 'LLPECp5oshiD',
        api_url: 'http://api.beta.named.com/toto/v1'
    }

    push_server_info = {
        wss_url: 'ws://192.168.226.113:8880/sub',
    }

    live_score_url = "http://sports.nnamed.com/gateway/livegames/live_schedule_gateway.php"
    // live_score_url = "http://score.beta.named.com/gateway/livegames/live_schedule_gateway.php"

}

// 개발서버
// http://score.beta.named.com/proto/
if (process.env.NODE_ENV == "development") {
    api_req_info = {
        api_name: 'named_pc',
        api_key: 'rbvLq2Ah5wBl',
        api_url: 'http://api.named.com/toto/v1'
    }

    push_server_info = {
        wss_url: 'ws://172.16.20.45:8880/sub',
    }

    live_score_url = "http://score.dev.named.com/gateway/livegames/live_schedule_gateway.php"
}

/**
 * 웹푸시 subscribe list
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