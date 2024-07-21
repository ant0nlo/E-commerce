import React from 'react'
import './Navbar.css'
import navlogo from '../../assets/full-logo2.png'
import navProfile from '../../assets/profile-picture.png'

function Navbar() {
  return (
    <div className='navbar'>
        <img src={navlogo} alt="" className="nav-logo" />
        <img src={navProfile} alt="" className="nav-profile" />
    </div>
  )
}

export default Navbar