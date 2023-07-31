import React from 'react'

export default function Login({setUser,setRoom,joinRoom}){

    return (
        <div>
            <h3>Login</h3>
            <input type="text" placeholder="Name" 
            onChange={(event) => {setUser(event.target.value)}}/>
            <input type="text" placeholder="Room ID"
            onChange={(event) => {setRoom(event.target.value)}}/>
            <button onClick={joinRoom}>Join</button>
        </div>
    )
}