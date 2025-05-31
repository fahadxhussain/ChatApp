import React, { useState } from 'react';
import './addUser.css';
import {
  collection,
  query,
  where,
  getDocs,
  setDoc,
  serverTimestamp,
  doc,
  arrayUnion,
} from 'firebase/firestore';
import { db } from '../../../../lib/firebase';
import { useUserStore } from '../../../../lib/userStore';

function AddUser() {
  const [user, setUsr] = useState(null);
  const { currentUser } = useUserStore();

  const handleSearch = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const username = formData.get('username');

    try {
      const userRef = collection(db, 'users');
      const q = query(userRef, where('username', '==', username));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        setUsr(querySnapshot.docs[0].data());
      } else {
        setUsr(null);
      }
    } catch (err) {
      console.error('Error fetching user:', err);
    }
  };

  const handleAdd = async () => {
    if (!user || !currentUser) return;

    try {
      const chatRef = collection(db, 'chats');
      const userChatsRef = collection(db, 'userchats');

      // Create new chat document
      const newChatRef = doc(chatRef);
      await setDoc(newChatRef, {
        createdAt: serverTimestamp(),
        messages: [],
      });

      // Update other user's chat list
      await setDoc(
        doc(userChatsRef, user.id),
        {
          chats: arrayUnion({
            chatId: newChatRef.id,
            lastMessage: '',
            receiverId: currentUser.id,
            updatedAt: Date.now(),
          }),
        },
        { merge: true }
      );

      // Update current user's chat list
      await setDoc(
        doc(userChatsRef, currentUser.id),
        {
          chats: arrayUnion({
            chatId: newChatRef.id,
            lastMessage: '',
            receiverId: user.id,
            updatedAt: Date.now(),
          }),
        },
        { merge: true }
      );

      alert('User added successfully!');
      setUsr(null);
    } catch (err) {
      console.error('Error adding user:', err);
    }
  };

  return (
    <div className='addUser'>
      <form onSubmit={handleSearch}>
        <input type='text' placeholder='Username' name='username' />
        <button>Search</button>
      </form>

      {user && (
        <div className='user'>
          <div className='detail'>
            <img src='./avatar.png' alt='avatar' />
            <span>{user.username}</span>
          </div>
          <button onClick={handleAdd}>Add User</button>
        </div>
      )}
    </div>
  );
}

export default AddUser;
