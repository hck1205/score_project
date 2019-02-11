import getConfig from 'next/config'
const {publicRuntimeConfig} = getConfig()

export default () => (
    <div className="footer">
        <img src={`${publicRuntimeConfig.SUB_NAME}/static/img/box_1.png`} />
        <div className="footerTitle">프로토 정보 안내</div>
        <div className="footerContent">- 본 프로토 정보는 <span>가집계 결과</span>입니다.</div>
        <div className="footerContent">- 프로토 공식 결과는 <span>공식사이트에서 최종 확인</span>하시기 바랍니다.</div>
    </div>
)