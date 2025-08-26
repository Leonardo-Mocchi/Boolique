import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Profile.css';

const Profile = () => {
    const { currentUser, updateProfile, logout, getProfile } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        address: '',
        city: '',
        state: '',
        postal_code: '',
        country: '',
        phone: ''
    });

    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ type: '', content: '' });

    // Fetch profile data when component mounts
    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                // Recupera i dati completi dal profilo
                const profileData = await getProfile();

                // Aggiorna il form con i dati recuperati
                setFormData({
                    first_name: profileData.first_name || '',
                    last_name: profileData.last_name || '',
                    address: profileData.address || '',
                    city: profileData.city || '',
                    state: profileData.state || '',
                    postal_code: profileData.postal_code || '',
                    country: profileData.country || '',
                    phone: profileData.phone || ''
                });
            } catch (error) {
                console.error('Error fetching profile:', error);
                setMessage({
                    type: 'danger',
                    content: 'Errore nel recupero dei dati del profilo'
                });
            } finally {
                setLoading(false);
            }
        };

        // Se l'utente è loggato, recupera i dati del profilo
        if (currentUser) {
            fetchUserProfile();
        } else {
            setLoading(false);
        }
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', content: '' });

        try {
            await updateProfile(formData);

            setMessage({
                type: 'success',
                content: 'Profile updated successfully!'
            });

            // Clear message after 3 seconds
            setTimeout(() => {
                setMessage({ type: '', content: '' });
            }, 3000);

        } catch (error) {
            setMessage({
                type: 'danger',
                content: `Error: ${error.message}`
            });
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    }; if (!currentUser) {
        return <div className="profile-container">Loading...</div>;
    }

    if (loading) {
        return <div className="profile-container">
            <div className="d-flex justify-content-center">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        </div>;
    }

    return (
        <div className="profile-container">
            <div className="profile-content">
                <h2>My Profile</h2>

                {message.content && (
                    <div className={`alert alert-${message.type}`}>
                        {message.content}
                    </div>
                )}

                <div className="profile-info mb-4">
                    <p><strong>Email:</strong> {currentUser.email}</p>
                </div>

                <h4>Personal Information</h4>

                <form onSubmit={handleSubmit} className="profile-form">
                    <div className="row">
                        <div className="col-md-6">
                            <div className="form-group">
                                <label htmlFor="first_name">First Name</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="first_name"
                                    name="first_name"
                                    value={formData.first_name}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="col-md-6">
                            <div className="form-group">
                                <label htmlFor="last_name">Last Name</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="last_name"
                                    name="last_name"
                                    value={formData.last_name}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="address">Address</label>
                        <input
                            type="text"
                            className="form-control"
                            id="address"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="row">
                        <div className="col-md-6">
                            <div className="form-group">
                                <label htmlFor="city">City</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="city"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="col-md-6">
                            <div className="form-group">
                                <label htmlFor="state">State/Province *</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="state"
                                    name="state"
                                    value={formData.state}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-6">
                            <div className="form-group">
                                <label htmlFor="postal_code">Postal Code</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="postal_code"
                                    name="postal_code"
                                    value={formData.postal_code}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="col-md-6">
                            <div className="form-group">
                                <label htmlFor="country">Country</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="country"
                                    name="country"
                                    value={formData.country}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="phone">Phone *</label>
                        <input
                            type="tel"
                            className="form-control"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="profile-actions">
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : 'Save changes'}
                        </button>

                        <button
                            type="button"
                            className="btn btn-link change-password-link"
                            onClick={() => navigate('/change-password')}
                        >
                            Change Password
                        </button>
                    </div>
                </form>

                <div className="profile-logout">
                    <button
                        onClick={handleLogout}
                        className="btn btn-outline-danger"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Profile;
