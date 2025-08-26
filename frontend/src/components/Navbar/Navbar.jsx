import React, { useState, useEffect, useRef } from 'react';
import './navbar.css';
import SearchBar from '../SearchBar/SearchBar';
import Cart from '../Cart/Cart';
import UserMenu from '../UserMenu/UserMenu';
import { Link } from 'react-router-dom';
import { useGlobal } from '../../contexts/GlobalContext';
import { useAuth } from '../../contexts/AuthContext';


const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { wardrobeSections, fetchWardrobeSections } = useGlobal();
    const { currentUser } = useAuth();
    const menuRef = useRef(null);

    useEffect(() => {
        fetchWardrobeSections();
    }, []);

    useEffect(() => {
        if (isMenuOpen) {
            document.body.classList.add('no-scroll');
        } else {
            document.body.classList.remove('no-scroll');
        }

        // Clean up quando il componente si smonta
        return () => document.body.classList.remove('no-scroll');
    }, [isMenuOpen]);

    // Effetto per chiudere il menu quando si clicca all'esterno
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isMenuOpen && menuRef.current && !menuRef.current.contains(event.target) &&
                !event.target.closest('.hamburgerMenu')) {
                setIsMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isMenuOpen]);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const closeMenu = () => {
        if (isMenuOpen) {
            setIsMenuOpen(false);
        }
    };

    return (
        <div className="navbar ">
            {/* Top row - Logo, search and user controls */}
            <div className="navbar-top-row">
                {/* Logo on the left */}
                <div className="navbar-left" onClick={closeMenu}>
                    <Link to="/">
                        <div className="logo">
                            <img src="/img/logo.svg" alt="Boolique Logo" />
                            <h1 className="header_title">Boolique</h1>
                        </div>
                    </Link>
                </div>

                {/* Search and user controls on the right */}
                <div className="navbar-right">
                    <div onClick={closeMenu}>
                        <SearchBar />
                    </div>
                    <div className="d-md-block d-none" onClick={closeMenu}>
                        <UserMenu />
                    </div>
                    <div onClick={closeMenu}>
                        <Cart />
                    </div>
                    <div className="hamburgerMenu" onClick={toggleMenu}>
                        <i className={`fa-solid ${isMenuOpen ? 'fa-xmark' : 'fa-bars'}`}></i>
                    </div>
                </div>
            </div>
            {/* Bottom row with centered navigation links */}
            <div className="navbar-bottom-row">
                <ul className={`nav-links ${isMenuOpen ? 'menuOpen' : ''}`} ref={menuRef}>
                    <li className="navlink" onClick={closeMenu}><Link to="/">Home</Link></li>
                    {wardrobeSections.map(section => (
                        <li key={section.id} className="navlink" onClick={closeMenu}>
                            <Link to={`/wardrobe-section/${section.slug}`}>{section.name}</Link>
                        </li>
                    ))}
                    <li className="navlink" onClick={closeMenu}><Link to="/search">Catalog</Link></li>
                    {/* Aggiunto il link della wishlist come elemento della navbar */}
                    <li className="navlink" onClick={closeMenu}>
                        <Link to="/wishlist" className="d-flex align-items-center">
                            <i className="bi bi-heart"></i>
                            <span className="ms-2">Wishlist</span>
                        </Link>
                    </li>
                    {/* Aggiungo i pulsanti di login/register solo nel menu mobile */}
                    <li className="navlink d-md-none" onClick={closeMenu}>
                        <div className="mobile-auth-buttons">
                            <UserMenu />
                        </div>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default Navbar;
