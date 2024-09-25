// ShopContext.js
import React, { createContext, useEffect, useState } from "react";

export const ShopContext = createContext(null);
const IP = process.env.REACT_APP_IP;

// Инициализиране на количката като празен обект
const getDefaultCart = () => {
    return {}; // Празен обект, тъй като размерите ще се добавят динамично
}

const ShopContextProvider = (props) => {
    const [all_product, set_all_product] = useState([]);
    const [cartItems, setCartItems] = useState(getDefaultCart());

    useEffect(() => {
        // Вземане на всички продукти от backend
        fetch(`http://${IP}:4000/allproducts`)
            .then((res) => res.json())
            .then((data) => set_all_product(data))
            .catch((error) => console.error("Error fetching products:", error));

        // Вземане на количката, ако потребителят е логнат
        const token = localStorage.getItem('auth-token');
        if (token) {
            fetch(`http://${IP}:4000/getcart`, {
                method: "POST",
                headers: {
                    'Accept': 'application/json', // Поправен хедър
                    'Content-Type': 'application/json',
                    'auth-token': token,
                },
                body: JSON.stringify({}) // Изпращане на празен обект
            })
            .then((res) => res.json())
            .then((data) => setCartItems(data))
            .catch((error) => console.error("Error fetching cart:", error));
        }
    }, []);

    // Функция за добавяне на продукт в количката с размер
    const addToCart = (itemId, size) => {
        const cartKey = `${itemId}-${size}`; // Комбинация от itemId и size
        setCartItems((prev) => ({
            ...prev,
            [cartKey]: (prev[cartKey] || 0) + 1
        }));
        if (localStorage.getItem('auth-token')) {
            fetch(`http://${IP}:4000/addtocart`, {
                method: "POST",
                headers: {
                    'Accept': 'application/json', // Поправен хедър
                    'Content-Type': 'application/json',
                    'auth-token': `${localStorage.getItem('auth-token')}`,
                },
                body: JSON.stringify({ "itemId": itemId, "size": size })
            })
            .then((res) => res.json())
            .then((data) => console.log("Add to cart response:", data))
            .catch((error) => console.error("Error adding to cart:", error));
        }
    }

    const removeFromCart = (itemId, size) => {
    const cartKey = `${itemId}-${size}`; // Комбинация от itemId и size
    setCartItems((prev) => {
        const updatedCart = { ...prev };
        if (updatedCart[cartKey] > 0) {
            updatedCart[cartKey] -= 1;
        }
        if (updatedCart[cartKey] === 0) {
            delete updatedCart[cartKey]; // Изтриване на ключа, ако количеството е 0
        }
        return updatedCart;
    });
    // След това, добави логиката за актуализиране на бекенда
    if (localStorage.getItem('auth-token')) {
        fetch(`http://${IP}:4000/removefromcart`, {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'auth-token': `${localStorage.getItem('auth-token')}`,
            },
            body: JSON.stringify({ "itemId": itemId, "size": size })
        })
        .then((res) => res.json())
        .then((data) => console.log("Remove from cart response:", data))
        .catch((error) => console.error("Error removing from cart:", error));
    }
}

    // Функция за изчисляване на общата сума в количката
    const getTotalCartAmount = () => {
        let totalAmount = 0;
        for (const cartKey in cartItems) {
            if (cartItems[cartKey] > 0) {
                const [itemId, size] = cartKey.split('-');
                const itemInfo = all_product.find((product) => product.id === Number(itemId));
                if (itemInfo) {
                    totalAmount += itemInfo.new_price * cartItems[cartKey];
                }
            }
        }
        return totalAmount;
    };

    // Функция за изчисляване на общия брой продукти в количката
    const getTotalCartItems = () => {
        let totalItem = 0;
        for (const cartKey in cartItems) {
            if (cartItems[cartKey] > 0) {
                totalItem += cartItems[cartKey];
            }
        }
        return totalItem;
    }

    const contextValue = { 
        getTotalCartItems, 
        getTotalCartAmount, 
        all_product, 
        cartItems, 
        addToCart, 
        removeFromCart 
    }   

    return (
        <ShopContext.Provider value={contextValue}>
            {props.children}
        </ShopContext.Provider>
    )
}

export default ShopContextProvider;
