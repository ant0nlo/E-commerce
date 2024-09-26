import React, { useEffect, useState } from 'react'
import './NewCollections.css'
import Item from "../item/Item"
const IP = 'localhost'

function NewCollections() {
  
  const[new_coll,set_new_coll] = useState([])
  useEffect(()=>{
    fetch(`http://${IP}:4000/newcollections`)
    .then((res)=>res.json())
    .then((data)=>set_new_coll(data))
  },[])

  return (
    <div className='new-collections'>
        <h1>NEW COLLECTIONS</h1>
        <hr />
        <div className="collections">
            {new_coll.map((item, i)=>{
                return <Item key={i} id={item.id} name={item.name} image={item.image} 
                new_price={item.new_price} old_price={item.old_price} />
            })}
        </div>
    </div>
  )
}

export default NewCollections