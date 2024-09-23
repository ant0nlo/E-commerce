import './App.css';
import { Routes,Route, BrowserRouter } from 'react-router-dom';
import Navbar from './components/navbar/Navbar.jsx'
import Shop from './pages/Shop.jsx'
import ShopCategory from './pages/ShopCategory';
import Product from './pages/Product';
import Cart from './pages/Cart';
import Payment from './pages/Payment';
import LoginSignup from './pages/LoginSignup';
import Footer from './components/footer/Footer.jsx'
import men_banner from './components/Assets/mens2.png'
import women_banner from './components/Assets/womens3.png'
import kid_banner from './components/Assets/kids2.png'


function App() {
  return (
    <div >
    <BrowserRouter>
     <Navbar />
      <Routes>
        <Route path='/' element={<Shop/>} />
        <Route path='/mens' element={<ShopCategory banner={men_banner} category='men' />} />
        <Route path='/womens' element={<ShopCategory banner={women_banner} category='women' />} />
        <Route path='/kids' element={<ShopCategory banner={kid_banner} category='kid'/>} />
        <Route path='/product/:productId' element={<Product />} />
        <Route path='/cart' element={<Cart />} />
        <Route path='/payment' element={<Payment />}/> 
        <Route path='/login' element={<LoginSignup />} />
      </Routes>
     <Footer />
    </BrowserRouter>
    </div>
  );
}

export default App;
