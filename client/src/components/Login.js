import React from 'react'
import '../App.css'

export default function Login({setUser,setRoom,joinRoom}){

    return (
        <div className='Login-box'>
                <h3>Login</h3>
            <div className='login-info' onKeyDown={(event) =>{(event.key === 'Enter')&&joinRoom()}}>
                <input type="text" placeholder="Name" 
                onChange={(event) => {setUser(event.target.value)}}/>
                <input type="text" placeholder="Room ID"
                onChange={(event) => {setRoom(event.target.value)}}/>
                <button onClick={joinRoom} class='join-button'>Join</button>
            </div >
            <p>Hello! welcome to my chat application! All chats and users will be deleted upon leaving room and
                all users will be deleted after 10 minutes of inactivity.
                <br></br>
                will look into adding popular roomid in the bottom here if feel like it
            </p>
        </div>
    )
}