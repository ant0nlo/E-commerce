import React, { useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; 
import './PaymentPage.css';
import { ShopContext } from '../../context/ShopContext';
import axios from 'axios'; // Използвайте axios за по-лесно управление на HTTP заявките

const PAYPAL_CLIENT_ID = process.env.REACT_APP_CLIENT_ID;    

const PaymentPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { orderData } = location.state || {}; // Получаване на orderData с shipmentInfo
    const { clearCart } = useContext(ShopContext);


    useEffect(() => {
        if (!orderData) {
            alert('Missing order details. Please try again.');
            navigate('/cart');
            return;
        }

        const script = document.createElement('script');
        script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}`;
        script.async = true;
        script.onload = () => {
            window.paypal.Buttons({
                createOrder: (data, actions) => {
                    return actions.order.create({
                        purchase_units: [{
                            amount: {
                                value: orderData.total.toString()
                            }
                        }]
                    });
                },
                onApprove: async (data, actions) => {
                    const paymentResult = await actions.order.capture();
                    console.log('Payment successful!', paymentResult);

                    try {
                        // Изпращане на потвърждение за плащане към Payment Service
                        const response = await axios.post('https://e-commerce-payment-service.onrender.com/payment/confirm', {
                            orderId: paymentResult.id, // Идентификаторът от PayPal
                            paymentResult: {
                                ...paymentResult,
                                items: orderData.items,
                                total: orderData.total,
                                userEmail: orderData.userEmail
                            },
                            shipmentInfo: orderData.shipmentInfo
                        }, {
                            headers: {
                                'Authorization': `Bearer ${localStorage.getItem('token')}` // Ако използвате JWT
                            }
                        });

                        if (response.data.success) {
                            // Навигиране към страница за потвърждение на поръчката
                            navigate('/order-confirmation', { state: { orderId: response.data.orderId } });
                            // Опционално: Изчистване на кошницата
                            clearCart();
                        } else {
                            alert('Payment confirmation failed. Please contact support.');
                        }
                    } catch (error) {
                        console.error('Error confirming payment:', error);
                        alert('An error occurred while confirming your payment.');
                    }
                },
                onCancel: () => {
                    alert('Payment was cancelled.');
                    navigate('/cart');
                },
                onError: (err) => {
                    console.error('Error with PayPal payment:', err);
                    alert('An error occurred during the payment process.');
                    navigate('/cart');
                }
            }).render('#paypal-button-container');
        };
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, [orderData, navigate]);

    return (
        <div className="payment-page">
            <h1>Payment Page</h1>
            <h2>Total Amount: ${orderData.total}</h2>
            <div id="paypal-button-container"></div>
        </div>
    );
};

export default PaymentPage;
