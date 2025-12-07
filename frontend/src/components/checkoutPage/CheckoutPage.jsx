// frontend/components/CheckoutPage/CheckoutPage.jsx

import React, { useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShopContext } from '../../context/ShopContext';

const CheckoutPage = () => {
    const navigate = useNavigate();
    const { cartItems, getTotalCartAmount } = useContext(ShopContext);

    const formattedCartItems = useMemo(() => (
        Object.entries(cartItems)
            .filter(([, quantity]) => quantity > 0)
            .map(([key, quantity]) => {
                const [productId, size] = key.split('-');
                return {
                    productId: Number(productId),
                    size: (size || '').toUpperCase(),
                    quantity,
                };
            })
    ), [cartItems]);

    const total = useMemo(() => getTotalCartAmount(), [cartItems, getTotalCartAmount]);

    const handlePlaceOrder = async () => {
        try {
            if (formattedCartItems.length === 0) {
                alert('Your cart is empty.');
                return;
            }

            const emailResponse = await fetch('http://localhost:4000/getUserEmail', {
                method: 'GET',
                headers: {
                    'auth-token': localStorage.getItem('auth-token'),
                },
            });

            const emailData = await emailResponse.json();

            if (!emailResponse.ok || !emailData.email) {
                alert('Failed to fetch user details. Please log in again.');
                return;
            }

            const response = await fetch('http://localhost:4000/order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    items: formattedCartItems,
                    total: total,
                    userEmail: emailData.email
                })
            });

            const result = await response.json();
            if (response.ok && result.orderId) {
                // Redirect to Payment Page with orderId and totalAmount
                navigate('/payment', { state: { orderId: result.orderId, totalAmount: total } });
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
