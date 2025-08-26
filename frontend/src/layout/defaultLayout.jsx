import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar/Navbar'
import Footer from '../components/footer/footer'
import ScrollToTop from '../components/ScrollToTop/ScrollToTop'

function DefaultLayout() {
    return (
        <>
            <Navbar />
            <div className="main-container">
                <Outlet />
                <Footer />
            </div>
            <ScrollToTop />
        </>
    )
}

export default DefaultLayout