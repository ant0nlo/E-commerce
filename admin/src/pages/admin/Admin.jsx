import React from 'react'
import Sidebar from '../../components/sidebar/Sidebar'
import './Admin.css'
import {Routes, Route} from 'react-router-dom'
import AddProduct from '../../components/addProduct/AddProduct'
import ListProduct from '../../components/listProduct/ListProduct'

function Admin() {
  return (
    <div className='admin'>
        <Sidebar />
        <Routes>
            <Route path='/addproduct' element={<AddProduct />} />
            <Route path='/listproduct' element={<ListProduct />} />

        </Routes>
    </div>
  )
}

export default Admin