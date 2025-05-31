import React, { useState } from 'react';
import './login.css';
import { toast } from 'react-toastify';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';


function Login() {
  

  const [avatar, setAvatar] = useState({
    file: null,
    url: ''
  });

  const handleAvatar = (e) => {
    if (e.target.files[0]) {
      setAvatar({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0])
      });
    }
  };


  const [loading, setLoading] = useState(false)

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true)

    const formData = new FormData(e.target)

    const {username, email, password} = Object.fromEntries(formData)
    
    try{
      const res = await createUserWithEmailAndPassword(auth, email, password);


      await setDoc(doc(db, "users", res.user.uid), {
        username,
        email,
        id: res.user.uid,
        blocked: []
      })


      await setDoc(doc(db, "userchats", res.user.uid), {
        chats: []
      })

      toast.success("Account Created Successfully. Please Login Now")

    }
    catch(err){
      console.log(err)
      toast.error(err)
    }

    finally{
      setLoading(false)
    }
  };



  
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true)


    const formData = new FormData(e.target)
    const { email, password} = Object.fromEntries(formData)

    try{
      await signInWithEmailAndPassword(auth, email, password)
      toast.success("Logged In")
    }
    catch(err){
      console.log(err)
      toast.error(err.message)
    }
    finally{
      setLoading(false)
    }
    
  };

  return (
    <div className='login'>
      <div className="item">
        <h2>Welcome Back</h2>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            name='email'
            
          />
          <input
            type="password"
            placeholder="Password"
            name='password'
            
          />
          <button type="submit" disabled={loading}>{loading? "Loading" : "Log In"}</button>
        </form>
      </div>

      <div className="separator"></div>

      <div className="item">
        <h2>Create an Account</h2>
        <form onSubmit={handleRegister}>


          <label htmlFor="file" style={{ cursor: 'pointer' }}>
            <img src={avatar.url || './avatar.png'} alt="avatar" />
            <div>Upload Profile Photo</div>
          </label>

          
          <input
            type="file"
            id="file"
            style={{ display: 'none' }}
            onChange={handleAvatar}
            accept="image/*"
          />
          <input
            type="text"
            placeholder="Username"
            name='username'
            
          />
          <input
            type="email"
            placeholder="Email"
            name='email'
            
          />
          <input
            type="password"
            placeholder="Password"
            name='password'
            
          />
          <button type="submit" disabled={loading}>{loading? "Loading" : "Sign Up"}</button>
        </form>
      </div>
    </div>
  );
}

export default Login;
