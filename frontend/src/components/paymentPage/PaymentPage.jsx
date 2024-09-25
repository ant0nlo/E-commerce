import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; 
import './PaymentPage.css';
import { toast } from 'react-toastify';

const CLIENT_ID = process.env.REACT_APP_CLIENT_ID;
const IP = process.env.REACT_APP_IP;

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
        script.src = `https://www.paypal.com/sdk/js?client-id=${CLIENT_ID}`; // Заменете с вашия клиентски идентификатор
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
                        const response = await fetch(`http://${IP}:5001/api/payment/confirm`, {
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
                                navigate('/', { state: { orderId: orderId } });
                        } else {
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
