import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './ChangePassword.css';

const ChangePassword = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();

    const [formData, setFormData] = useState({
        current_password: '',
        new_password: '',
        confirm_password: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Validazione
        if (formData.new_password !== formData.confirm_password) {
            return setError('Le nuove password non corrispondono');
        }

        if (formData.new_password.length < 6) {
            return setError('La nuova password deve essere di almeno 6 caratteri');
        }

        setLoading(true);

        try {
            const token = localStorage.getItem('token');

            if (!token) {
                throw new Error('Utente non autenticato');
            }

            const response = await fetch('http://localhost:3000/api/v1/auth/change-password', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    current_password: formData.current_password,
                    new_password: formData.new_password
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Errore durante il cambio password');
            }

            setSuccess('Password aggiornata con successo!');

            // Reset del form
            setFormData({
                current_password: '',
                new_password: '',
                confirm_password: ''
            });

            // Redirect al profilo dopo 2 secondi
            setTimeout(() => {
                navigate('/profile');
            }, 2000);

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!currentUser) {
        return <div className="change-password-container">Caricamento in corso...</div>;
    }

    return (
        <div className="change-password-container">
            <div className="change-password-content">
                <h2>Cambia Password</h2>

                {error && (
                    <div className="alert alert-danger" role="alert">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="alert alert-success" role="alert">
                        {success}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="change-password-form">
                    <div className="form-group">
                        <label htmlFor="current_password">Password attuale</label>
                        <input
                            type="password"
                            className="form-control"
                            id="current_password"
                            name="current_password"
                            value={formData.current_password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="new_password">Nuova password</label>
                        <input
                            type="password"
                            className="form-control"
                            id="new_password"
                            name="new_password"
                            value={formData.new_password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirm_password">Conferma nuova password</label>
                        <input
                            type="password"
                            className="form-control"
                            id="confirm_password"
                            name="confirm_password"
                            value={formData.confirm_password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="change-password-actions">
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                        >
                            {loading ? 'Aggiornamento...' : 'Aggiorna password'}
                        </button>

                        <button
                            type="button"
                            className="btn btn-link back-link"
                            onClick={() => navigate('/profile')}
                        >
                            Torna al profilo
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ChangePassword;
