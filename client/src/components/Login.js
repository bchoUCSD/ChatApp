import React from 'react'
import '../App.css'

export default function Login({setUser,setRoom,joinRoom}){

    const [roomList, setRoomList] = React.useState([])
    const [clicked, setClicked] = React.useState(false)

    async function getRooms(){
        setClicked(prevClicked => !prevClicked)
        await fetch('http://localhost:5000/api/rooms').then(res => res.json()).then(json => {
            setRoomList(json.listOfRooms)
        })
    }

    return (
        <div className='Login-box'>
                <div className='title' style={{marginBottom:'' }}>
                    <h1>ChatNow</h1>   
                </div>
            <div className='login-info' onKeyDown={(event) =>{(event.key === 'Enter')&&joinRoom()}}>
                <input type="text" placeholder="Name" 
                onChange={(event) => {setUser(event.target.value)}}/>
                <input type="text" placeholder="Room ID"
                onChange={(event) => {setRoom(event.target.value)}}/>
                <button onClick={joinRoom} className='join-button'>Join</button>
            </div >
            <p style={{fontSize:'18px'}}>Welcome to ChatNow! Rooms are cleared after the last user leaves and inactive users are removed after 10 minutes.
            </p>
            <div className='get-active'>
                <button onClick={getRooms} className='active-btn'>{clicked?'Hide':'Active Rooms'}</button>
                {clicked&&(roomList.length > 0? roomList.map((room,index) => {
                   return <li key={index} className='active-rooms'>{room}</li>
                }):<p style={{fontSize:'18px'}}>no active rooms</p>)}
            </div>
        </div>
    )
}