// ProductDisplay.jsx
import React, { useContext, useState } from 'react';
import './ProductDisplay.css';
import star_icon from '../Assets/star_icon.png';
import star_dull_icon from '../Assets/star_dull_icon.png';
import { ShopContext } from '../../context/ShopContext';

const ProductDisplay = (props) => {
    const { product } = props;
    const { addToCart } = useContext(ShopContext);
    const [selectedSize, setSelectedSize] = useState(''); // Добавено състояние за избрания размер

    const sizes = ['S', 'M', 'L', 'XL', 'XXL'];

    const handleSizeClick = (size) => {
        setSelectedSize(size);
    };

    const handleAddToCart = () => {
        if (!selectedSize) {
            alert("Моля, изберете размер преди добавяне в количката.");
            return;
        }
        // Можете да предадете и избрания размер към addToCart, ако е необходимо
        addToCart(product.id, selectedSize);
    };

    return (
        <div className='productdisplay'>
            <div className="productdisplay-left">
                <div className="productdisplay-img-list">
                    <img src={product.image} alt={`${product.name} thumbnail`} />
                    <img src={product.image} alt={`${product.name} thumbnail`} />
                    <img src={product.image} alt={`${product.name} thumbnail`} />
                    <img src={product.image} alt={`${product.name} thumbnail`} />
                </div>
                <div className="productdisplay-img">
                    <img className='productdisplay-main-img' src={product.image} alt={product.name} />
                </div>
            </div>
            <div className="productdisplay-right">
                <h1>{product.name}</h1>
                <div className="productdisplay-right-star">
                    <img src={star_icon} alt="Star" />
                    <img src={star_icon} alt="Star" />
                    <img src={star_icon} alt="Star" />
                    <img src={star_icon} alt="Star" />
                    <img src={star_dull_icon} alt="Star" />
                    <p>(122)</p>
                </div>
                <div className="productdisplay-right-prices">
                    <div className="productdisplay-right-price-old">${product.old_price}</div>
                    <div className="productdisplay-right-price-new">${product.new_price}</div>
                </div>
                <div className="productdisplay-right-description">
                    {product.description || product.name}
                </div>
                <div className="productdisplay-right-size">
                    <h1>Select Size</h1>
                    <div className="productdisplay-right-sizes">
                        {sizes.map((size) => (
                            <div
                                key={size}
                                className={`size-option ${selectedSize === size ? 'selected' : ''}`}
                                onClick={() => handleSizeClick(size)}
                            >
                                {size}
                            </div>
                        ))}
                    </div>
                </div>
                <button onClick={handleAddToCart}>ADD TO CART</button>
                <p className='productdisplay-right-category'><span>Category : </span>{product.category}</p>
                <p className='productdisplay-right-category'><span>Tags : </span>{product.tags}</p>
            </div>
        </div>
    );
};

export default ProductDisplay;
