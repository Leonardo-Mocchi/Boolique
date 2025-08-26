import React from 'react';
import { Link } from 'react-router-dom';
import '../index.css'; // Import to ensure fonts are available
import './NotFound.css';

const NotFound = () => {
    return (
        <div className="main-container not-found-container">
            <div className="not-found-logo">
                <div className="logo-circle">
                    <img
                        src="/img/logo.svg"
                        alt="Boolique Logo"
                        className="logo-image"
                    />
                </div>

                <h1 className="brand-title">Boolique</h1>
            </div>

            <div className="not-found-content">
                <h2 className="error-code">404</h2>
                <h3 className="error-title">Pagina Non Trovata</h3>
                <p className="error-message">La pagina che stai cercando non esiste o è stata spostata.</p>
            </div>

            <div className="gold-divider"></div>

            <div className="action-buttons">
                <Link to="/" className="home-button">
                    <i className="bi bi-house me-2"></i>Torna alla Home
                </Link>

                <Link to="/search" className="browse-button">
                    <i className="bi bi-bag me-2"></i>Sfoglia Catalogo
                </Link>
            </div>
        </div>
    );
};

export default NotFound;
