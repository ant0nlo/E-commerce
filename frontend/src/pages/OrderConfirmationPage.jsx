import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './CSS/OrderConfirmationPage.css'; // Създайте CSS файл за стилове

const OrderConfirmationPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { orderId } = location.state || {};

    if (!orderId) {
        navigate('/cart');
        return null;
    }

    return (
        <div className="order-confirmation">
            <h1>Thank You for Your Purchase!</h1>
            <p>Your order has been successfully placed.</p>
            <p>Order ID: {orderId}</p>
            <button onClick={() => navigate('/')}>Go to Home</button>
        </div>
    );
};

export default OrderConfirmationPage;