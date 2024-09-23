// frontend/components/CheckoutPage/CheckoutPage.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CheckoutPage = () => {
    const [cart, setCart] = useState([]); // Fetch cart items from state or context
    const [total, setTotal] = useState(0); // Calculate total amount
    const navigate = useNavigate();

    const handlePlaceOrder = async () => {
        try {
            const response = await fetch('/api/order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    items: cart,
                    total: total,
                    userEmail: 'user@example.com' // Replace with actual user email
                })
            });

            const result = await response.json();
            if (result.orderId) {
                // Redirect to Payment Page with orderId and totalAmount
                navigate.push('/payment', { orderId: result.orderId, totalAmount: total });
            } else {
                alert('Failed to place order. Please try again.');
            }
        } catch (error) {
            console.error('Error placing order:', error);
            alert('An error occurred while placing your order.');
        }
    };

    return (
        <div className="checkout-page">
            <h1>Checkout</h1>
            {/* Render cart items and total */}
            <button onClick={handlePlaceOrder}>Place Order</button>
        </div>
    );
};

export default CheckoutPage;    