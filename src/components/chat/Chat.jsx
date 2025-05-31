import React, { useEffect, useRef, useState } from 'react';
import './chat.css';
import EmojiPicker from 'emoji-picker-react';
import { arrayUnion, doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useChatStore } from '../../lib/chatStore';
import { useUserStore } from '../../lib/userStore';

function Chat({ setShowDetail }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [chat, setChat] = useState(null);
  const { chatId, user: selectedUser , isCurrentUserBlocked, isReceiverBlocked} = useChatStore();
  const { currentUser } = useUserStore();
  const endRef = useRef(null);

  useEffect(() => {  
    if (!chatId) return; // safety check
    
    const unSub = onSnapshot(doc(db, 'chats', chatId), (res) => {
      setChat(res.data());
    });

    return () => unSub();
  }, [chatId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat?.messages]);

  const handleEmoji = (e) => {
    setText((prev) => prev + e.emoji);
    setOpen(false);
  };

  const handleSend = async () => {
    if (text === '') return;

    try {
      await updateDoc(doc(db, "chats", chatId), {
        messages: arrayUnion({
          senderId: currentUser.id,
          text,
          createdAt: new Date(),
        }),
      });

      const userIDs = [currentUser.id, selectedUser.id];

      userIDs.forEach(async (id) => {
        const userChatsRef = doc(db, "userchats", id);
        const userChatsSnapshot = await getDoc(userChatsRef);

        if (userChatsSnapshot.exists()) {
          const userChatsData = userChatsSnapshot.data();
          const chatIndex = userChatsData.chats.findIndex(c => c.chatId === chatId);

          if (chatIndex !== -1) {
            userChatsData.chats[chatIndex].lastMessage = text;
            userChatsData.chats[chatIndex].isSeen = id === currentUser.id;
            userChatsData.chats[chatIndex].updatedAt = Date.now();

            await updateDoc(userChatsRef, {
              chats: userChatsData.chats,
            });
          }
        }
      });

      setText(''); // clear input after sending
    } catch (err) {
      console.error(err);
    }
  };

  const handleShowDetail = () => {
    setShowDetail((prev) => !prev);
  };

  return (
    <div className="chat">
      {/* Top Bar */}
      <div className="top">
        <div className="user">
          <img src={selectedUser?.avatar || './avatar.png'} alt="" />
          <div className="texts">
            <span>{selectedUser?.username || 'Select a user'}</span>
            <p>{selectedUser?.description || ''}</p>
          </div>
        </div>
        <div className="icons">
          <img src="./phone.png" alt="" />
          <img src="./video.png" alt="" />
          <img src="./info.png" alt="" onClick={handleShowDetail} />
        </div>
      </div>

      {/* Message Center */}
      <div className="center">
        {chat?.messages?.map((m, index) => (
          <div
            key={index}
            className={`message ${m.senderId === currentUser.id ? 'own' : ''}`}
          >
            {m.senderId !== currentUser.id && (
              <img src={selectedUser?.avatar || './avatar.png'} alt="" />
            )}
            <div className="texts">
              {m.img && <img src={m.img} alt="" />}
              {m.text && <p>{m.text}</p>}
              <span>{new Date(m.createdAt?.toDate?.() || m.createdAt).toLocaleTimeString()}</span>
            </div>
          </div>
        ))}
        <div ref={endRef}></div>
      </div>

      {/* Bottom Bar */}
      <div className="bottom">
        <div className="icons">
          <img src="./img.png" alt="" />
          <img src="./camera.png" alt="" />
          <img src="./mic.png" alt="" />
        </div>
        <input
          type="text"
          placeholder= {isCurrentUserBlocked || isReceiverBlocked? "You cannot send any message" : "Type a message"}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          disabled= {isCurrentUserBlocked || isReceiverBlocked}
        />
        <div className="emoji">
          <img
            src="./emoji.png"
            alt=""
            onClick={() => setOpen((prev) => !prev)}
          />
          {open && (
            <div className="picker">
              <EmojiPicker onEmojiClick={handleEmoji} />
            </div>
          )}
        </div>
        <button className="sendButton" onClick={handleSend} disabled= {isCurrentUserBlocked || isReceiverBlocked}>Send</button>
      </div>
    </div>
  );
}

export default Chat;
