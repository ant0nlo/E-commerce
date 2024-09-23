import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; 
import './PaymentPage.css';
import { toast } from 'react-toastify';


const PaymentPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { orderId, totalAmount } = location.state || {}; // Ensure orderId and totalAmount are passed

    useEffect(() => {
        if (!orderId || !totalAmount) {
            alert('Missing order details. Please try again.');
            navigate('/cart');
            return;
        }

        const script = document.createElement('script');
        script.src = "https://www.paypal.com/sdk/js?client-id=AW_5OvedqUq6Y5o3uzg4TlIYi_UalDmwVebxbkLULYjlA_LyUlOz1l7wQPALxxHHKbIjsAutmMsMatzq"; // Replace with your PayPal client ID
        script.async = true;
        script.onload = () => {
            window.paypal.Buttons({
                createOrder: (data, actions) => {
                    return actions.order.create({
                        purchase_units: [{
                            amount: {
                                value: totalAmount.toString()
                            }
                        }]
                    });
                },
                onApprove: async (data, actions) => {
                    const paymentResult = await actions.order.capture();
                    console.log('Payment successful!', paymentResult);

                    // Notify backend about the payment success
                    try {
                        const response = await fetch('http://localhost:5001/api/payment/confirm', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${localStorage.getItem('token')}` // Assuming JWT is stored in localStorage
                            },
                            body: JSON.stringify({
                                orderId: orderId,
                                paymentResult: paymentResult
                            })
                        });

                        const result = await response.json();
                        if (result.success) {
                            // Redirect to order confirmation page
                            navigate.push('/order-confirmation', { orderId: orderId });
                        } else {
                            // Handle payment confirmation failure
                            alert('Payment confirmation failed. Please contact support.');
                        }
                    } catch (error) {
                        console.error('Error confirming payment:', error);
                        alert('An error occurred while confirming your payment.');
                    }
                },
                onError: (err) => {
                    console.error('Error with PayPal payment:', err);
                    alert('An error occurred during the payment process.');
                }
            }).render('#paypal-button-container');
        };
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, [orderId, totalAmount, navigate]);

    return (
        <div className="payment-page">
            <h1>Payment Page</h1>
            <h2>Total Amount: ${totalAmount}</h2>
            <div id="paypal-button-container"></div>
        </div>
    );
};

export default PaymentPage;