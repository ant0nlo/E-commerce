import React, { useState } from 'react'
import './CSS/LoginSignup.css'

const LoginSignup = () => {

  const [state,setState] = useState("Login")
  const [formData, setFormData] = useState({
    username:"",
    password:"",
    email:"",
  })

  const changeHandle= (e)=>{
    setFormData({...formData, [e.target.name]:e.target.value})
  }

  const login = async()=>{
    console.log('Login Function Executed',formData);
    let responseData;
    await fetch('http://localhost:4000/login', {
        method:"POST",
        headers:{
          Accept: 'application/from-data',
          'Content-Type':"application/json"
        },
        body:JSON.stringify({formData})
      })
      .then((response)=>response.json())
      .then((data)=>{responseData=data})

      if(responseData.success){
        localStorage.setItem('auth-token',responseData.token)
        window.location.replace("/")
      }else{
        alert(responseData.errors)
      }
  }
  const signup = async()=>{
    console.log('Signup Function Executed',formData);

    let responseData;
    await fetch('http://localhost:4000/signup', {
      method:"POST",
      headers:{
        Accept: 'application/from-data',
        'Content-Type':"application/json"
      },
      body:JSON.stringify({formData})
    })
    .then((response)=>response.json())
    .then((data)=>{responseData=data})

    if(responseData.success){
      localStorage.setItem('auth-token',responseData.token)
      window.location.replace("/")
    }else{
      alert(responseData.errors)
    }

  }

  return (
    <div className='loginsighup'>
        <div className="loginsighup-container">
            <h1>{state}</h1>
            <div className="loginsighup-fields">
                {state==="Sign Up"? <input name='username' value={formData.username} onChange={changeHandle} type="text" placeholder='Your name' />:<></>}
                <input name='email' value={formData.email} onChange={changeHandle} type="email" placeholder='Email'/>
                <input name='password' value={formData.password} onChange={changeHandle} type="password" placeholder='Password' />
            </div>
            <button onClick={()=>{state==="Login"?login():signup()}}>Continue</button>
            {
            state==="Sign Up"?
            <p className="loginsighup-login">Already have an account? <span onClick={()=>{setState("Login")}}>Login here</span></p>
            : <p className="loginsighup-login">Create an account? <span onClick={()=>{setState("Sign Up")}}>Click here</span></p>
            }
            <div className="loginsighup-agree">
                <input type="checkbox" name='' id='' />
                <p>By continuing, i agree to the terms of use & privacy policy.</p>
            </div>
        </div>
    </div>
  )
}

export default LoginSignup