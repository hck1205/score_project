import Header from './header'
import Footer from './footer'

const Layout = (props) => (
    <div>
        <Header />
            <div className="pageContainer">{props.children}</div>
        <Footer />
    </div>
)

export default Layout