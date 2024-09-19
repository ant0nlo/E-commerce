import React from 'react'
import './Hero.css'
import banner from '../Assets/banner3.jpg'

const Hero = () => {
  return (
    <div className='hero'>
        <div className="hero-left">
            <div>
            <img className='banner' src={banner} alt="" />
            </div>
            
        </div>
    </div>
  )
}

export default Hero