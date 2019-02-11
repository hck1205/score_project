import Header from 'next/head'
import getConfig from 'next/config'
const {publicRuntimeConfig} = getConfig()

export default () => (
    <div>
        <Header>
            <title>네임드 프로토 정보</title>
            <meta name="viewport" content="initial-scale=1.0, width=device-width" />
            <link rel="stylesheet" href={`${publicRuntimeConfig.SUB_NAME}/static/css/normalize.css`} />
            <link rel="stylesheet" href={`${publicRuntimeConfig.SUB_NAME}/static/css/index.css?v=${publicRuntimeConfig.QUERY_TIME}`} />
            <link rel="stylesheet" href={`${publicRuntimeConfig.SUB_NAME}/static/css/eventComp.css?v=${publicRuntimeConfig.QUERY_TIME}`} />
            <link rel="stylesheet" href={`${publicRuntimeConfig.SUB_NAME}/static/css/oddComp.css?v=${publicRuntimeConfig.QUERY_TIME}`} />
            <link rel="stylesheet" href={`${publicRuntimeConfig.SUB_NAME}/static/css/oddPopup.css?v=${publicRuntimeConfig.QUERY_TIME}`} />
            <link rel="stylesheet" href={`${publicRuntimeConfig.SUB_NAME}/static/css/tableComp.css?v=${publicRuntimeConfig.QUERY_TIME}`} />
            <link rel="stylesheet" href={`${publicRuntimeConfig.SUB_NAME}/static/css/headerComp.css?v=${publicRuntimeConfig.QUERY_TIME}`} />
            <link rel="stylesheet" href={`${publicRuntimeConfig.SUB_NAME}/static/css/optionComp.css?v=${publicRuntimeConfig.QUERY_TIME}`} />
            <link rel="stylesheet" href={`${publicRuntimeConfig.SUB_NAME}/static/css/unoverScoreComp.css?v=${publicRuntimeConfig.QUERY_TIME}`} />
            <link rel="stylesheet" href={`${publicRuntimeConfig.SUB_NAME}/static/css/adSenseComp.css?v=${publicRuntimeConfig.QUERY_TIME}`} />
            <link rel="stylesheet" href={`${publicRuntimeConfig.SUB_NAME}/static/css/cal_components/stickyMenuComp.css?v=${publicRuntimeConfig.QUERY_TIME}`} />
            <link rel="shortcut icon" type="image/x-icon" href="https://image.named.com/score_web/favicon.ico?v=180612" />
            <link rel="apple-touch-icon-precomposed" href="https://image.named.com/score_web/mobile_favicon.png?v=180612" />
            <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>
            <script src='https://cdnjs.cloudflare.com/ajax/libs/babel-polyfill/6.23.0/polyfill.min.js' />
        </Header>
    </div>
)