// ShopCategory.jsx
import React, { useContext, useState, useMemo } from "react";
import './CSS/ShopCategory.css';
import { ShopContext } from "../context/ShopContext";
import dropdown_icon from '../components/Assets/dropdown_icon.png';
import Item from '../components/item/Item.jsx';

const ShopCategory = (props) => {
    const { all_product } = useContext(ShopContext);
    
    // Състояние за броя на показаните продукти
    const [displayedCount, setDisplayedCount] = useState(12);
    
    // Състояние за избраното сортиране
    const [sortOption, setSortOption] = useState('default');
    
    // Функция за обработка на промяната на сортирането
    const handleSortChange = (e) => {
        setSortOption(e.target.value);
        setDisplayedCount(12); // Ресетиране на броя показани продукти при промяна на сортирането
    };
    
    // Функция за зареждане на повече продукти
    const handleExploreMore = () => {
        setDisplayedCount(prevCount => prevCount + 12);
    };
    
    // Филтриране на продуктите по категория
    const filteredProducts = useMemo(() => {
        return all_product.filter(product => product.category === props.category);
    }, [all_product, props.category]);
    
    // Сортиране на филтрираните продукти
    const sortedProducts = useMemo(() => {
        let sorted = [...filteredProducts];
        if (sortOption === 'price-asc') {
            sorted.sort((a, b) => a.new_price - b.new_price);
        } else if (sortOption === 'price-desc') {
            sorted.sort((a, b) => b.new_price - a.new_price);
        }
        return sorted;
    }, [filteredProducts, sortOption]);
    
    // Определяне на продуктите, които да се покажат
    const displayedProducts = useMemo(() => {
        return sortedProducts.slice(0, displayedCount);
    }, [sortedProducts, displayedCount]);
    
    // Общ брой продукти в категорията
    const totalProducts = filteredProducts.length;
    
    // Брой продукти, които се показват
    const showingEnd = Math.min(displayedCount, totalProducts);
    
    return (
        <div className='shop-category'>
            <img className="shopcategory-banner" src={props.banner} alt="Banner" />
            <div className="shopcategory-indexSort">
                <p>
                    <span>Showing 1-{showingEnd}</span> out of {totalProducts} products 
                </p>
                <div className="shopcategory-sort">
                    Sort by  
                    <select value={sortOption} onChange={handleSortChange}>
                        <option value="default"> Default</option>
                        <option value="price-asc"> Price: Low to High</option>
                        <option value="price-desc"> Price: High to Low</option>
                    </select>
                    <img src={dropdown_icon} alt="Sort Dropdown" />
                </div>
            </div>
            <div className="shopcategory-products">
                {displayedProducts.map((item) => (
                    <Item 
                        key={`${item.id}-${item.name}`} 
                        id={item.id} 
                        name={item.name} 
                        image={item.image} 
                        new_price={item.new_price} 
                        old_price={item.old_price} 
                        category={item.category}
                        tags={item.tags}
                    /> 
                ))}
            </div>
            {showingEnd < totalProducts && (
                <div className="shopcategory-loadmore">
                    <button onClick={handleExploreMore}>Explore More</button>
                </div>
            )}
        </div>
    )
}

export default ShopCategory;
