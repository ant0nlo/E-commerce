import React, { useEffect, useState } from 'react'
import './Popular.css'
import Item from "../item/Item"

const IP = process.env.REACT_APP_IP;   


const Popular = () => {

  const [popular, setPopular] = useState([])
  
  useEffect(()=>{
    fetch(`http://${IP}:4000/popularinwomen`)
    .then((res)=>res.json())
    .then((data)=>setPopular(data))
  }, [])

  return (
    <div className='popular'>
        <h1>POPULAR IN WOMEN</h1>
        <hr />
        <div className="popular-item">
            {popular.map((item,i)=>{
                return <Item key={i} id={item.id} name={item.name} image={item.image} 
                new_price={item.new_price} old_price={item.old_price} />
            })}
        </div>
    </div>
  )
}

export default Popular 

 

