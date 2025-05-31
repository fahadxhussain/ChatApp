import React, { useEffect, useState } from 'react';
import './chatList.css';
import AddUser from './addUser/AddUser';
import { useUserStore } from '../../../lib/userStore';
import { doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useChatStore } from '../../../lib/chatStore';


function ChatList() {
    const [addMode, setAddMode] = useState(false);
    const [chats, setChats] = useState([]);
    const [input, setInput] = useState("")

    const { currentUser } = useUserStore();
    const { changeChat } = useChatStore();

    useEffect(() => {
        if (!currentUser?.id) return;

        const unSub = onSnapshot(doc(db, "userchats", currentUser.id), async (res) => {
            const data = res.data();
            console.log("Snapshot data:", data);

            const items = Array.isArray(data?.chats) ? data.chats : [];

            const promises = items.map(async (item) => {
                if (!item?.receiverId) return null;

                try {
                    const userDocRef = doc(db, "users", item.receiverId);
                    const userDocSnap = await getDoc(userDocRef);
                    const user = userDocSnap.exists() ? userDocSnap.data() : null;
                    return { ...item, user };
                } catch (err) {
                    console.error("Error fetching user:", err);
                    return null;
                }
            });

            const chatData = (await Promise.all(promises)).filter(Boolean);
            setChats(chatData.sort((a, b) => b.updatedAt - a.updatedAt));
        });

        return () => {
            unSub();
        };
    }, [currentUser?.id]);


    const handleSelect = async (chat) => {
        const userChats = chats.map(item => {
            const {user, ...rest} = item;
            return rest;
        })

        const chatIndex = userChats.findIndex(item => item.chatId === chat.chatId)
        userChats[chatIndex].isSeen = true;

        const userChatsRef = doc(db, "userchats", currentUser.id)

        try{
            await updateDoc(userChatsRef, {
                chats:userChats,

            })

            changeChat(chat.chatId, chat.user)
        }
        catch(err){
            console.log(err)
        }
        
    }

    const filteredChats = chats.filter(c => c.user.username.toLowerCase().includes(input.toLowerCase()))

    return (
        <div className='chatList'>
            <div className="search">
                <div className="searchBar">
                    <img src="./search.png" alt="Search Icon" />
                    <input type="text" placeholder='Search' 
                    onChange={(e) => setInput(e.target.value)}
                    />
                </div>

                <img
                    src={addMode ? "./minus.png" : "./plus.png"}
                    alt="Toggle Add User"
                    className='add'
                    onClick={() => setAddMode(prev => !prev)}
                />
            </div>

            {filteredChats.map((chat) => (
                <div className="item" key={chat.chatId}
                onClick={() => handleSelect(chat)}
                style={{
                    backgroundColor: chat.isSeen? "transparent" : "#5183fe"
                }}
                >
                     <img src="./avatar.png" alt="User Avatar" />
                <div className="texts">
                    <span>{chat.user?.username || 'Unknown User'}</span>
                    <p>{chat.lastMessage}</p>
                 </div>
                 </div>
            ))};


            {addMode && <AddUser />}
        </div>
    );
}

export default ChatList;
