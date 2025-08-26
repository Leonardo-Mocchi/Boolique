import './footer.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { NavLink } from 'react-router-dom'; // Fixed import from react-router-dom

/**
 * Footer component
 * 
 * This component uses:
 * - Font Awesome icons (Font Awesome Free License)
 * - Bootstrap classes (MIT License)
 * - React Router components (MIT License)
 */
export default function Footer() {
    return (
        <>
            <footer className="">
                <div className="main-container">
                    <hr />
                    <div className="row justify-content-between align-items-center mb-3">
                        {/* Left sections container */}
                        <div className="col-12 col-md-5 mb-4">
                            <div className="row">
                                {/* First section */}
                                <div className="col-6">
                                    <h5 className="text-center">Information</h5>
                                    <ul className="nav flex-column text-center info-list">
                                        <li className="nav-item mb-2">
                                            <NavLink to="/story-site" className="nav-link p-0 footer-nav-link">Our Story</NavLink>
                                        </li>
                                        <li className="nav-item mb-2">
                                            <NavLink to="/privacy-policy" className="nav-link p-0 footer-nav-link">Privacy & Policy</NavLink>
                                        </li>
                                        <li className="nav-item mb-2">
                                            <NavLink to="/contacts" className="nav-link p-0 footer-nav-link">Contact Us</NavLink>
                                        </li>
                                        <li className="nav-item mb-2">
                                            <NavLink to="/unsubscribe-newsletter" className="nav-link p-0 footer-nav-link">Newsletter Unsubscribe</NavLink>
                                        </li>
                                    </ul>
                                </div>

                                {/* Second section */}
                                <div className="col-6">
                                    <h5 className="text-center">Products</h5>
                                    <ul className="nav flex-column text-center info-list">
                                        <li className="nav-item mb-2">
                                            <NavLink to="/" className="nav-link p-0 footer-nav-link">Exclusive Offers</NavLink>
                                        </li>
                                        <li className="nav-item mb-2">
                                            <NavLink to="/search" className="nav-link p-0 footer-nav-link">Catalog</NavLink>
                                        </li>
                                        <li className="nav-item mb-2">
                                            <NavLink to="/size-table" className="nav-link p-0 footer-nav-link">Size Guide</NavLink>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Right box container */}
                        <div className="col-12 col-md-7 d-flex justify-content-center justify-content-md-end">
                            <div className="info-box p-4 border rounded text-center">
                                <h5>Contact Us</h5>
                                <p className="mb-1"><strong>Phone:</strong> +39 345 678 9012</p>
                                <p className="mb-1">
                                    <strong>Email:</strong> <a href="mailto:bulique.noreply@gmail.com" className="footer-link">boolique.noreply@gmail.com</a>
                                </p>
                                <p className="mb-1"><strong>VAT N°:</strong> IT12345678901</p>
                                <div className="social-links mt-3">
                                    <a href="#" className="me-3 facebook">
                                        <i className="fab fa-facebook fa-lg"></i>
                                    </a>
                                    <a href="#" className="me-3 twitter">
                                        <i className="fab fa-twitter fa-lg"></i>
                                    </a>
                                    <a href="#" className="instagram">
                                        <i className="fab fa-instagram fa-lg"></i>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </>
    );
}
