import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './OrdersHistory.css';

const OrdersHistory = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        console.log('Current user:', currentUser);
        if (currentUser) {
            fetchOrders();
        }
    }, [currentUser]);

    const fetchOrders = () => {
        const user = JSON.parse(localStorage.getItem('user'));
        const token = localStorage.getItem('token');

        console.log('User:', user);
        // Check if user exists
        if (user && user.id) {
            fetch(`http://localhost:3000/api/v1/orders/user/${user.id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            })
                .then(response => response.json()).then(data => {
                    console.log('Orders retrieved:', data);
                    if (data.success && data.orders) {
                        setOrders(data.orders);
                    } else {
                        setError('Invalid data format');
                    }
                    setLoading(false);
                })
                .catch(error => {
                    console.error('Error retrieving orders:', error);
                    setError('Error connecting to the server');
                    setLoading(false);
                });
        } else {
            setError('No user found');
            setLoading(false);
        }
    };

    // Format the date in English format
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    };    // Calculate the order status with the corresponding color
    const getOrderStatus = (status) => {
        // Convert status to lowercase to handle values uniformly
        const statusLower = status ? status.toLowerCase() : '';

        const statusMap = {
            'pending': { text: 'Pending', class: 'status-pending' },
            'processing': { text: 'Processing', class: 'status-processing' },
            'completed': { text: 'Completed', class: 'status-delivered' },
            'cancelled': { text: 'Cancelled', class: 'status-cancelled' }
        };

        return statusMap[statusLower] || { text: status, class: '' };
    };

    // (Unused functions removed)

    return (
        <div className="orders-container">
            <div className="orders-content">
                <h2>My Orders</h2>

                {loading ? (
                    <div className="text-center my-5">
                        <div className="spinner-border" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                ) : error ? (
                    <div className="alert alert-danger">{error}</div>
                ) : orders.length === 0 ? (
                    <div className="orders-empty">
                        <p>You haven't placed any orders yet.</p>
                        <button
                            className="btn btn-primary"
                            onClick={() => navigate('/catalogo')}
                        >
                            Start Shopping
                        </button>
                    </div>
                ) : (
                    <div className="orders-list">
                        {orders.map(order => {
                            const statusInfo = getOrderStatus(order.status);

                            return (<div key={order.order_id} className="order-card">
                                <div className="order-header">
                                    <div>
                                        <h5>Order #{order.numeric_id || order.order_id}</h5>
                                        <p className="order-date">{formatDate(order.order_date)}</p>
                                    </div>
                                    <div className={`order-status ${statusInfo.class}`}>
                                        {statusInfo.text}
                                    </div>
                                </div>

                                <div className="order-details p-3">
                                    <p>Date: {new Date(order.order_date).toLocaleDateString('en-US')}</p>
                                    <p>Total: €{order.final_price}</p>
                                </div>                                    <div className="order-items">
                                    <div className="order-item-summary">
                                        <span>Total items: {order.total_items}</span>
                                    </div>
                                </div>
                            </div>
                            );
                        })}
                    </div>
                )}

                <div className="orders-actions">
                    <button
                        className="btn btn-link"
                        onClick={() => navigate('/profile')}
                    >
                        Back to Profile
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrdersHistory;
