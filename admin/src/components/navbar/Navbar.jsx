import React from 'react';
import './Navbar.css';
import navlogo from '../../assets/bag_logo2.png';
import navProfile from '../../assets/profile-picture.png';

function Navbar() {
  return (
    <div className='navbar'>
      <div className="nav-logo-text">
        <img src={navlogo} alt="Logo" className="nav-logo" />
        <span className="nav-text">SHOPPER</span>
      </div>
      <img src={navProfile} alt="Profile" className="nav-profile" />
    </div>
  );
}

export default Navbar;
