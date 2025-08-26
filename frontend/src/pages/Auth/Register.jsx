import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Auth.css';

const Register = () => {
    const navigate = useNavigate();
    const { register } = useAuth();

    // Email validation function - returns true if valid
    const isValidEmail = (email) => {
        const re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return re.test(String(email).toLowerCase());
    };

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        confirm_password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Custom email validation in addition to form validation
        if (formData.email && !isValidEmail(formData.email)) {
            setError('Please enter a valid email address');
            return;
        }

        // Check form validity using Bootstrap validation
        if (!e.target.checkValidity()) {
            e.preventDefault();
            e.stopPropagation();
            e.target.classList.add('was-validated');
            return;
        }

        setLoading(true);

        // Additional validation
        if (formData.password !== formData.confirm_password) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long');
            setLoading(false);
            return;
        }

        try {
            // Utilizza la funzione register fornita dal contesto di autenticazione
            await register({
                first_name: formData.first_name,
                last_name: formData.last_name,
                email: formData.email,
                password: formData.password
            });

            // Imposta il messaggio di successo            
            setSuccess(true);

            // Aggiungiamo un piccolo ritardo per garantire che il contesto di autenticazione 
            // abbia il tempo di aggiornarsi prima del reindirizzamento
            setTimeout(() => {
                navigate('/');
            }, 1000);

        } catch (err) {
            // Translate common Italian error messages to English
            let errorMessage = err.message;

            // Check for specific Italian error messages and translate them
            if (errorMessage.includes("Email già registrata")) {
                errorMessage = "This email address is already registered. Please use a different email or try logging in.";
            } else if (errorMessage.includes("già registrata") || errorMessage.includes("già esistente")) {
                errorMessage = "This account already exists. Please try logging in instead.";
            }

            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2 className="auth-title">Register</h2>

                {success && (
                    <div className="alert alert-success mt-2 mb-3" role="alert">
                        <i className="fa-solid fa-check-circle me-2"></i>
                        Registration completed successfully! You will be redirected...
                    </div>
                )}

                {error && (
                    <div
                        className="alert alert-danger border-danger shadow-sm mt-2 mb-3"
                        role="alert"
                        style={{
                            // Removed animation: 'fadeIn 0.5s' which was overriding the CSS animation
                            padding: '15px',
                            fontSize: '1rem',
                            fontWeight: '500'
                        }}
                    >
                        <div className="d-flex align-items-center">
                            <i className="fa-solid fa-triangle-exclamation me-2" style={{ fontSize: '1.2rem' }}></i>
                            <span>{error}</span>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="auth-form needs-validation" noValidate>
                    <div className="form-group">
                        <label htmlFor="first_name">First Name</label>
                        <input
                            type="text"
                            className="form-control"
                            id="first_name"
                            name="first_name"
                            value={formData.first_name}
                            onChange={handleChange}
                            required
                            pattern="[A-Za-z\s]{2,50}"
                        />
                        <div className="invalid-feedback">
                            Please provide your first name (2-50 characters, letters only).
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="last_name">Last Name</label>
                        <input
                            type="text"
                            className="form-control"
                            id="last_name"
                            name="last_name"
                            value={formData.last_name}
                            onChange={handleChange}
                            required
                            pattern="[A-Za-z\s]{2,50}"
                        />
                        <div className="invalid-feedback">
                            Please provide your last name (2-50 characters, letters only).
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            className="form-control"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                        <div className="invalid-feedback" style={{ display: formData.email && !isValidEmail(formData.email) ? 'block' : '' }}>
                            Please enter a valid email address (e.g., example@domain.com)
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            className="form-control"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            minLength="6"
                        />
                        <div className="invalid-feedback">
                            Password must be at least 6 characters long.
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirm_password">Confirm Password</label>
                        <input
                            type="password"
                            className="form-control"
                            id="confirm_password"
                            name="confirm_password"
                            value={formData.confirm_password}
                            onChange={handleChange}
                            required
                        />
                        <div className="invalid-feedback">
                            Please confirm your password.
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="auth-button"
                        disabled={loading}
                    >
                        {loading ? 'Registering...' : 'Register'}
                    </button>

                    {/* Added duplicate error message below button */}
                    {error && (
                        <div
                            className="alert alert-danger mt-3 mb-0"
                            role="alert"
                        >
                            <div className="d-flex align-items-center">
                                <i className="fa-solid fa-triangle-exclamation me-2"></i>
                                <span>{error}</span>
                            </div>
                        </div>
                    )}
                </form>

                <div className="auth-redirect">
                    Already have an account? <Link to="/login">Sign In</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
