import React from 'react'
import "./detail.css"
import { auth, db } from '../../lib/firebase'
import { useChatStore } from '../../lib/chatStore'
import { useUserStore } from '../../lib/userStore';
import { arrayRemove, arrayUnion, doc, updateDoc } from 'firebase/firestore';

function Detail() {

    const { chatId, user, isCurrentUserBlocked, isReceiverBlocked, changeBlock} = useChatStore();

    const {currentUser} = useUserStore();

    const handleBlock = async () => {
        if(!user) return;

        const userDocRef = doc(db, 'users', currentUser.id)

        try{
            await updateDoc(userDocRef, {
                blocked: isReceiverBlocked? arrayRemove(user.id) : arrayUnion(user.id),

            })

            changeBlock()
        }
        catch(err){
            console.log(err)
        }

    }

    return (
        <div className='detail'>
            <div className="user">
                <img src="./avatar.png" alt="" />
                <h2>{user.username}</h2>
                <p>User Description</p>
            </div>
            <div className="info">
                <div className="option">
                    <div className="title">
                        <span>Chat Settings</span>
                        <img src="./arrowUp.png" alt="" />
                    </div>
                </div>

                <div className="option">
                    <div className="title">
                        <span>Privacy & Help</span>
                        <img src="./arrowUp.png" alt="" />
                    </div>
                </div>

                <div className="option">
                    <div className="title">
                        <span>Shared Photos</span>
                        <img src="./arrowDown.png" alt="" />
                    </div>

                    <div className="photos">
                        <div className="photoItem">
                            <div className="photoDetail">
                                <img src="https://images.pexels.com/photos/38136/pexels-photo-38136.jpeg?auto=compress&cs=tinysrgb&w=1200" alt="" />
                                <span>photo_2025_chatapp</span>
                            </div>
                            
                            <img src="./downloadIcon.png" alt="" className='icon'/>
                        </div>


                        <div className="photoItem">
                            <div className="photoDetail">
                                <img src="https://images.pexels.com/photos/38136/pexels-photo-38136.jpeg?auto=compress&cs=tinysrgb&w=1200" alt="" />
                                <span>photo_2025_chatapp</span>
                            </div>
                            
                            <img src="./downloadIcon.png" alt="" className='icon'/>
                        </div>


                        <div className="photoItem">
                            <div className="photoDetail">
                                <img src="https://images.pexels.com/photos/38136/pexels-photo-38136.jpeg?auto=compress&cs=tinysrgb&w=1200" alt="" />
                                <span>photo_2025_chatapp</span>
                            </div>
                            
                            <img src="./downloadIcon.png" alt="" className='icon'/>
                        </div>
                        
                    </div>

                </div>

                <div className="option">
                    <div className="title">
                        <span>Shared Files</span>
                        <img src="./arrowUp.png" alt="" />
                    </div>
                </div>

                <button
                onClick={handleBlock}
                >{isCurrentUserBlocked? "You are Blocked" : isReceiverBlocked? "Unblock User" : "Block User"}</button>
                
            </div>
        </div>
    )
}

export default Detail
