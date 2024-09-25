import React, { useContext } from 'react'
import { useNavigate } from 'react-router-dom'; // Вместо useHistory
import { ShopContext } from '../../context/ShopContext'
import './CartItems.css'
import remove_icon from '../Assets/cart_cross_icon.png'

const IP = process.env.REACT_APP_IP;

const CartItems = () => {
    const navigate = useNavigate(); // Инициализирайте useNavigate
    const {getTotalCartAmount, all_product, cartItems, removeFromCart} = useContext(ShopContext)

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
            // Извличане на имейла от базата данни, ако е необходимо
            const userEmailResponse = await fetch(`http://${IP}:4000/getUserEmail`, {
                method: 'GET',
                headers: {
                    'auth-token': localStorage.getItem('auth-token'),
                },
            });
            
            const userEmailData = await userEmailResponse.json();
    
            if (!userEmailResponse.ok) {
                alert('Failed to retrieve user email');
                return;
            }
    
            const orderData = {
                items: orderItems,
                total: getTotalCartAmount(),
                userEmail: userEmailData.email, // Използвайте имейла от базата данни
            };

             const response = await fetch(`http://${IP}:3001/order`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderData),
            });
    
            const data = await response.json();
            if (response.ok) {
                navigate('/payment', { state: { orderId: data.orderId, totalAmount: orderData.total } });
            } else {
                alert(`Failed to place order: ${data.error}`);
            }
        } catch (error) {
            console.error('Error during checkout:', error);
            alert('There was an error processing your order. Please try again.');
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
        {/* {all_product.map((e)=>{
            if(cartItems[e.id]>0){
                return <div>
                    <div className="cartitems-format">
                        <img src={e.image} className='carticon-product-icon' alt="" />
                        <p>{e.name}</p>
                        <p>${e.new_price}</p>
                        <button className='cartitems-quantity'>{cartItems[e.id]}</button>
                        <p>${e.new_price * cartItems[e.id]}</p>
                        <img className='carticon-remove-icon' src={remove_icon} onClick={()=>{removeFromCart(e.id)}} alt="" />
                    </div>
                    <hr />
            </div> 
            }
            return null;
        })} */}
        {Object.keys(cartItems).map((key) => {
                const [itemId, size] = key.split('-'); // Разделяме ключа на itemId и size
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
                <h1>cart Totals</h1>
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
                <p>Enter a promoocode</p>
                <div className="cartitems-promobox">
                    <input type="text" placeholder='promo code' />
                    <button>Submit</button>
                </div>
            </div>
        </div>
    </div>
  )
}

export default CartItems
