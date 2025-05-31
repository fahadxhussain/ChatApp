import React, { useState } from 'react';
import './login.css';
import { toast } from 'react-toastify';
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { auth, db } from '../../lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

function Login() {
  const [avatar, setAvatar] = useState({
    file: null,
    url: ''
  });

  const [loading, setLoading] = useState(false);

  const handleAvatar = (e) => {
    if (e.target.files[0]) {
      setAvatar({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0])
      });
    }
  };

  // REGISTER
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target);
    const { username, email, password } = Object.fromEntries(formData);

    try {
      // Create Firebase Auth user
      const res = await createUserWithEmailAndPassword(auth, email, password);

      // Send verification email
      await sendEmailVerification(res.user);

      // Save user to Firestore immediately
      await setDoc(doc(db, "users", res.user.uid), {
        username,
        email,
        id: res.user.uid,
        blocked: []
      });

      // Create empty chats doc
      await setDoc(doc(db, "userchats", res.user.uid), {
        chats: []
      });

      toast.success("Verification email sent. Please verify before logging in.");
      await signOut(auth); // Logout immediately after signup

    } catch (err) {
      console.log(err);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  // LOGIN
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target);
    const { email, password } = Object.fromEntries(formData);

    try {
      const res = await signInWithEmailAndPassword(auth, email, password);

      // Reload user object to get the latest emailVerified state
      await res.user.reload();

      if (!auth.currentUser.emailVerified) {
        toast.error("Email not verified. Check your inbox.");
        await sendEmailVerification(auth.currentUser);
        await signOut(auth);
        return;
      }

      // User is verified — get user info from Firestore
      const userDoc = await getDoc(doc(db, "users", res.user.uid));

      if (!userDoc.exists()) {
        toast.error("User data not found.");
        return;
      }

      const userData = userDoc.data();
      toast.success(`Welcome back, ${userData.username}!`);

    } catch (err) {
      console.log(err);
      toast.error(err.message);
    } finally {
      setLoading(false);
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
            required
          />
          <input
            type="password"
            placeholder="Password"
            name='password'
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? "Loading..." : "Log In"}
          </button>
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
            required
          />
          <input
            type="email"
            placeholder="Email"
            name='email'
            required
          />
          <input
            type="password"
            placeholder="Password"
            name='password'
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? "Loading..." : "Sign Up"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
