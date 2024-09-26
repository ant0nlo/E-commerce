import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './ShipmentPage.css'; // Make sure the CSS file is properly linked

const ShipmentPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { orderData } = location.state || {};

    const [shipmentInfo, setShipmentInfo] = useState({
        fullName: '',
        address: '',
        city: '',
        postalCode: '',
        country: '',
        phoneNumber: ''
    });

    const [errors, setErrors] = useState({}); // State for storing validation errors

    const handleChange = (e) => {
        setShipmentInfo({
            ...shipmentInfo,
            [e.target.name]: e.target.value
        });
    };

    const validateFields = () => {
        let validationErrors = {};
        const phoneRegex = /^[0-9]{10,15}$/; // Regex for validating phone number (10-15 digits)
        const postalCodeRegex = /^[0-9]{5,10}$/; // Regex for validating postal code (5-10 digits)

        for (let key in shipmentInfo) {
            if (!shipmentInfo[key]) {
                validationErrors[key] = 'This field is required';
            } else {
                // Additional validation for specific fields
                if (key === 'phoneNumber' && !phoneRegex.test(shipmentInfo[key])) {
                    validationErrors[key] = 'Phone number must be between 10 to 15 digits';
                }
                if (key === 'postalCode' && !postalCodeRegex.test(shipmentInfo[key])) {
                    validationErrors[key] = 'Postal code must be between 5 to 10 digits';
                }
            }
        }

        setErrors(validationErrors);
        return Object.keys(validationErrors).length === 0; // Return true if no errors
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validateFields()) {
            return; // If there are validation errors, stop the submission
        }

        // Navigating to Payment Page with all necessary data
        navigate('/payment', { 
            state: { 
                orderData: { 
                    ...orderData, 
                    shipmentInfo 
                } 
            } 
        });
    };

    return (
        <div className="shipment-page">
            <h1>Shipment Information</h1>
            <form onSubmit={handleSubmit} className="shipment-form">
                <label>
                    Full Name:
                    <input 
                        type="text" 
                        name="fullName" 
                        value={shipmentInfo.fullName} 
                        onChange={handleChange} 
                        required 
                    />
                    {errors.fullName && <span className="error">{errors.fullName}</span>}
                </label>
                <label>
                    Address:
                    <input 
                        type="text" 
                        name="address" 
                        value={shipmentInfo.address} 
                        onChange={handleChange} 
                        required 
                    />
                    {errors.address && <span className="error">{errors.address}</span>}
                </label>
                <label>
                    City:
                    <input 
                        type="text" 
                        name="city" 
                        value={shipmentInfo.city} 
                        onChange={handleChange} 
                        required 
                    />
                    {errors.city && <span className="error">{errors.city}</span>}
                </label>
                <label>
                    Postal Code:
                    <input 
                        type="text" 
                        name="postalCode" 
                        value={shipmentInfo.postalCode} 
                        onChange={handleChange} 
                        required 
                    />
                    {errors.postalCode && <span className="error">{errors.postalCode}</span>}
                </label>
                <label>
                    Country:
                    <input 
                        type="text" 
                        name="country" 
                        value={shipmentInfo.country} 
                        onChange={handleChange} 
                        required 
                    />
                    {errors.country && <span className="error">{errors.country}</span>}
                </label>
                <label>
                    Phone Number:
                    <input 
                        type="tel" 
                        name="phoneNumber" 
                        value={shipmentInfo.phoneNumber} 
                        onChange={handleChange} 
                        required 
                    />
                    {errors.phoneNumber && <span className="error">{errors.phoneNumber}</span>}
                </label>
                <button type="submit">Proceed to Payment</button>
            </form>
        </div>
    );
};

export default ShipmentPage;