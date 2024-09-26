import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShopContext } from '../../context/ShopContext';
import './CartItems.css';
import remove_icon from '../Assets/cart_cross_icon.png';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;   

const CartItems = () => {
    const navigate = useNavigate();
    const { getTotalCartAmount, all_product, cartItems, removeFromCart } = useContext(ShopContext);

    const handleCheckout = async () => {
        const orderItems = Object.keys(cartItems).map(key => {
            const [itemId, size] = key.split('-');
            return {
                productId: Number(itemId),
                size,
                quantity: cartItems[key]
            };
        });

        try {
            // Извличане на имейла на потребителя
            const userEmailResponse = await fetch(`${BACKEND_URL}/getUserEmail`, {
                method: 'GET',
                headers: {
                    'auth-token': localStorage.getItem('auth-token'),
                },
            });

            const userEmailData = await userEmailResponse.json();

            if (!userEmailResponse.ok) {
                alert('Неуспешно извличане на имейла на потребителя');
                return;
            }

            const orderData = {
                items: orderItems,
                total: getTotalCartAmount(),
                userEmail: userEmailData.email,
            };

            // Навигиране към Shipment Page с orderData
            navigate('/shipment', { state: { orderData } });
        } catch (error) {
            console.error('Грешка по време на процеса на поръчка:', error);
            alert('Възникна грешка при обработката на вашата поръчка. Моля, опитайте отново.');
        }
    };

    return (
        <div className='cartitems'>
            <div className="cartitems-format-main">
                <p>Products</p>
                <p>Title</p>
                <p>Price</p>
                <p>Quantity</p>
                <p>Total</p>
                <p>Remove</p>
            </div>
            <hr />
            {Object.keys(cartItems).map((key) => {
                const [itemId, size] = key.split('-');
                const product = all_product.find((p) => p.id === Number(itemId));

                if (product && cartItems[key] > 0) {
                    return (
                        <div key={key}>
                            <div className="cartitems-format">
                                <img src={product.image} className='carticon-product-icon' alt={product.name} />
                                <p>{product.name}</p>
                                <p>${product.new_price}</p>
                                <button className='cartitems-quantity'>{cartItems[key]}</button>
                                <p>${product.new_price * cartItems[key]}</p>
                                <img
                                    className='carticon-remove-icon'
                                    src={remove_icon}
                                    onClick={() => { removeFromCart(Number(itemId), size); }}
                                    alt="Remove"
                                />
                            </div>
                            <hr />
                        </div>
                    );
                }
                return null;
            })}
            <div className="cartitems-down">
                <div className="cartitems-total">
                    <h1>Cart Totals</h1>
                    <div>
                        <div className='cartitems-total-item'>
                            <p>Subtotal</p>
                            <p>${getTotalCartAmount()}</p>
                        </div>
                        <hr />
                        <div className="cartitems-total-item">
                            <p>Shipping Fee</p>
                            <p>Free</p>
                        </div>
                        <hr />
                        <div className="cartitems-total-item">
                            <h3>Total</h3>
                            <h3>${getTotalCartAmount()}</h3>
                        </div>
                    </div>
                    <button onClick={handleCheckout}>PROCEED TO CHECKOUT</button>
                </div>
                <div className="cartitems-promocode">
                    <p>Enter a promo code</p>
                    <div className="cartitems-promobox">
                        <input type="text" placeholder='Promo code' />
                        <button>Submit</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartItems;