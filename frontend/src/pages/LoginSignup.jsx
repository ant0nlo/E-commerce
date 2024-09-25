// frontend/components/LoginSignup.jsx

import React, { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './CSS/LoginSignup.css';
const IP = process.env.REACT_APP_IP;

const LoginSignup = () => {

  const [state, setState] = useState("Login");
  const [formData, setFormData] = useState({
    username:"",
    password:"",
    email:"",
  });
  
  const [isChecked, setIsChecked] = useState(false);

  const changeHandle = (e) => {
    setFormData({...formData, [e.target.name]:e.target.value});
  }

  const handleCheckboxChange = (e) => {
    setIsChecked(e.target.checked);
  };

  const login = async () => {
    if (!isChecked) {
      toast.error("You must agree with the terms of use & privacy policy!");
      return;
    }
    console.log('Login Function Executed', formData);
    let responseData;
    try {
      const response = await fetch(`http://${IP}:4000/login`, {
          method:"POST",
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
         // credentials: 'include', // If using HttpOnly cookies
          body: JSON.stringify(formData)
        });
      responseData = await response.json();
    } catch (error) {
      console.error('Network error:', error);
      toast.error("Network error. Please try again later.");
      return;
    }

    if(responseData.success){
      localStorage.setItem('auth-token',responseData.token) // Remove if using cookies
      toast.success("Login successful!");
      window.location.replace("/");
    } else{
      toast.error(responseData.error);
    }
  }

  const signup = async () => {
    if (!isChecked) {
      toast.error("You must agree with the terms of use & privacy policy!");
      return;
    }
    console.log('Signup Function Executed', formData);

    let responseData;
    try {
      const response = await fetch(`http://${IP}:4000/signup`, {
        method:"POST",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
       // credentials: 'include', // If using HttpOnly cookies
        body: JSON.stringify(formData)
      });
      responseData = await response.json();
    } catch (error) {
      console.error('Network error:', error);
      toast.error("Network error. Please try again later.");
      return;
    }

    if(responseData.success){
      localStorage.setItem('auth-token',responseData.token) // Remove if using cookies
      toast.success("Signup successful!");
      window.location.replace("/");
    } else{
      toast.error(responseData.error);
    }

  }

  return (
    <div className='loginsighup'>
        <div className="loginsighup-container">
            <h1>{state}</h1>
            <div className="loginsighup-fields">
                {state==="Sign Up" && 
                  <input 
                    name='username' 
                    value={formData.username} 
                    onChange={changeHandle} 
                    type="text" 
                    placeholder='Your name' 
                    required 
                  />
                }
                <input 
                  name='email' 
                  value={formData.email} 
                  onChange={changeHandle} 
                  type="email" 
                  placeholder='Email' 
                  required
                />
                <input 
                  name='password' 
                  value={formData.password} 
                  onChange={changeHandle} 
                  type="password" 
                  placeholder='Password' 
                  required 
                />
            </div>
            <button onClick={() => {state==="Login" ? login() : signup()}} disabled={!isChecked}>
              Continue
            </button>
            {
            state==="Sign Up" ?
            <p className="loginsighup-login">
              Already have an account? <span onClick={() => {setState("Login")}}>Login here</span>
            </p>
            : 
            <p className="loginsighup-login">
              Create an account? <span onClick={() => {setState("Sign Up")}}>Click here</span>
            </p>
            }
            <div className="loginsighup-agree">
                <input 
                  type="checkbox" 
                  name='' 
                  id='agree' 
                  checked={isChecked} 
                  onChange={handleCheckboxChange} 
                />
                <label htmlFor="agree">
                    By continuing, I agree to the <a href="/terms" target="_blank" rel="noopener noreferrer">terms of use </a> 
                    & <a href="/privacy" target="_blank" rel="noopener noreferrer">privacy policy</a>.
              </label>
            </div>
        </div>
        <ToastContainer /> {/* Render Toast Notifications */}
    </div>
  )
}

export default LoginSignup
