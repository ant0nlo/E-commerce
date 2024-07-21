import React from 'react'
import Hero from '../components/hero/Hero.jsx'
import Popular from '../components/popular/Popular.jsx'
import Offers from '../components/offers/Offers.jsx'
import NewCollections from '../components/newCollections/NewCollections.jsx'
import NewsLetter from '../components/newsLetter/NewsLetter.jsx'

const Shop = () => {
  return (
    <div>
        <Hero />
        <Popular />
        <Offers />
        <NewCollections />
        <NewsLetter />
    </div>
  )
}

export default Shop