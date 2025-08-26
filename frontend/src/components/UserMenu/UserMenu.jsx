import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './UserMenu.css';

const UserMenu = () => {
    const { currentUser, logout } = useAuth();
    const [menuOpen, setMenuOpen] = React.useState(false);

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    const handleLogout = () => {
        logout();
        setMenuOpen(false);
    };

    // Se non c'è un utente loggato, mostra i pulsanti di login/register
    if (!currentUser) {
        return (
            <div className="auth-buttons">
                <Link to="/login" className="login-button px-3">Login</Link>
                <Link to="/register" className="register-button px-3">Register</Link>
            </div>
        );
    }

    // Se c'è un utente loggato, mostra il menu utente
    return (
        <div className="user-menu-container">
            <button className="user-button" onClick={toggleMenu}>
                <i className="fa-solid fa-user"></i>
                <span className="user-name d-none d-sm-block">{currentUser.first_name}</span>
            </button>

            {menuOpen && (<div className="user-dropdown">
                <div className="user-info">
                    <h6>{`${currentUser.first_name} ${currentUser.last_name}`}</h6>
                    <span className="user-email">{currentUser.email}</span>
                </div>
                <div className="dropdown-divider"></div>
                <Link to="/profile" className="dropdown-item" onClick={() => setMenuOpen(false)}>
                    <i className="fa-solid fa-user-gear"></i>
                    Profile
                </Link>
                <Link to="/orders" className="dropdown-item" onClick={() => setMenuOpen(false)}>
                    <i className="fa-solid fa-box"></i>
                    My Orders
                </Link>
                <div className="dropdown-divider"></div>
                <button onClick={handleLogout} className="dropdown-item logout-item">
                    <i className="fa-solid fa-sign-out-alt"></i>
                    Logout
                </button>
            </div>
            )}
        </div>
    );
};

export default UserMenu;
