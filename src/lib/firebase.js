// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: "campusconnect-5973a.firebaseapp.com",
  projectId: "campusconnect-5973a",
  storageBucket: "campusconnect-5973a.firebasestorage.app",
  messagingSenderId: "692873408871",
  appId: "1:692873408871:web:371d90938101750aa9bfc2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth()
export const db = getFirestore()