import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom'; // За получаване на поръчковите данни
import './PaymentPage.css';

    
const PaymentPage = () => {
    const location = useLocation();
    const { orderData } = location.state; // Получаване на данните за поръчката

    useEffect(() => {
        // Зареждане на PayPal SDK
        const script = document.createElement('script');
        script.src = "https://www.paypal.com/sdk/js?client-id=AW_5OvedqUq6Y5o3uzg4TlIYi_UalDmwVebxbkLULYjlA_LyUlOz1l7wQPALxxHHKbIjsAutmMsMatzq"; // Заменете с вашия клиентски идентификатор
        script.async = true;
        script.onload = () => {
            // Когато скриптът се зареди, можете да инициирате бутона
            window.paypal.Buttons({
                createOrder: (data, actions) => {
                    return actions.order.create({
                        purchase_units: [{
                            amount: {
                                value: orderData.total.toString() // Общата сума
                            }
                        }]
                    });
                },
                onApprove: async (data, actions) => {
                    const order = await actions.order.capture();
                    console.log('Payment successful!', order);
                    // Извършете допълнителни действия, като обновление на поръчката в базата данни
                },
                onError: (err) => {
                    console.error('Error with PayPal payment:', err);
                }
            }).render('#paypal-button-container'); // Рендиране на PayPal бутона
        };
        document.body.appendChild(script); // Добавете скрипта към документа

        // Почистване при демонтиране на компонента
        return () => {
            document.body.removeChild(script);
        };
    }, [orderData.total]); // Добавете зависимост за orderData.total

    return (
        <div className="payment-page">
            <h1>Payment Page</h1>
            <h2>Total Amount: ${orderData.total}</h2>
            <h3>Payment Methods:</h3>
            <div id="paypal-button-container"></div> {/* Контейнер за PayPal бутона */}
        </div>
    );
};

export default PaymentPage;
