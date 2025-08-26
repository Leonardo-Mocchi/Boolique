import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './UnsubscribeNewsletter.css';

export default function UnsubscribeNewsletter() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [status, setStatus] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const response = await fetch(`http://localhost:3000/api/v1/newsletter/unsubscribe/${email}`, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (response.ok) {
                setStatus('success');
                setMessage('You have successfully unsubscribed from our newsletter.');
                setTimeout(() => {
                    navigate('/');
                }, 2000);
            } else {
                setStatus('error');
                setMessage(data.error || 'An error occurred during the unsubscribe process.');
            }
        } catch (error) {
            setStatus('error');
            setMessage('A connection error occurred.');
        }
    };

    return (
        <div className="unsubscribe-container">
            <div className="container py-5">
                <div className="row justify-content-center">
                    <div className="col-md-6">
                        <div className="card unsubscribe-card">
                            <div className="card-body p-5">
                                <div className="text-center mb-4">
                                    <i className="fas fa-envelope-open-text unsubscribe-icon"></i>
                                    <h2 className="unsubscribe-title">Newsletter Unsubscribe</h2>
                                    <p className="text-muted">
                                        We're sorry to see you go. Please enter your email to confirm unsubscription.
                                    </p>
                                </div>

                                {message && (
                                    <div className={`alert ${status === 'success' ? 'alert-success' : 'alert-danger'} fade show mb-4`}>
                                        <i className={`fas ${status === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} me-2`}></i>
                                        {message}
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="unsubscribe-form">
                                    <div className="form-floating mb-4">
                                        <input
                                            type="email"
                                            className="form-control custom-input"
                                            id="emailInput"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="Your email"
                                            required
                                        />
                                        <label htmlFor="emailInput">Your email</label>
                                    </div>
                                    <button type="submit" className="btn btn-lg w-100 unsubscribe-btn">
                                        <i className="fas fa-times-circle me-2"></i>
                                        Unsubscribe
                                    </button>
                                </form>

                                <div className="text-center mt-4">
                                    <a href="/" className="back-link">
                                        <i className="fas fa-arrow-left"></i>
                                        <span>Back to homepage</span>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}