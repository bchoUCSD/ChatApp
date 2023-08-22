import React from "react"
import Login from './components/Login.js'
import io from 'socket.io-client'
import { v4 as uuidv4 } from 'uuid';
// Bootstrap CSS
import "bootstrap/dist/css/bootstrap.min.css";
// Bootstrap Bundle JS
import "bootstrap/dist/js/bootstrap.bundle.min";
import './App.css'

const socket = io.connect('http://localhost:5000', {
})

export default function App(){

    const [user,setUser] = React.useState('')
    const [room, setRoom] = React.useState('')
    const [currMessage,setCurrMessage] = React.useState('')
    const [messages, setMessages] = React.useState([])
    const [login, setLogin] = React.useState(false)
    const [roomUsers, setRoomUsers] = React.useState([])

    const ref = React.useRef(null)

    /**
     * making an storing a sessionID that will persist and send to database to attach
     * to certain users, thus able to restore the session based on id
     */
    React.useEffect(() => {

        async function getData(theRoom){
            if(theRoom){
                await fetch(`http://localhost:5000/api/roomUsers/${theRoom}`)
                .then(response => response.json())
                .then(json => setRoomUsers(json.roomUsers))
                .catch(error => console.log(error))
    
                // getting existing messages
                await fetch(`http://localhost:5000/api/messages/${theRoom}`)
                .then(response => response.json())
                .then(json => setMessages(prevMessages => {
                    return [...prevMessages,...json.roomMsg]
                }))
                .catch(err => console.log(err))
            } else {
                console.log('room doesnt exist, cant make api call');
            }

        }
        async function previousUser(){
            const sessionID = sessionStorage.getItem('sessionID')
            if(sessionID){
                await fetch(`http://localhost:5000/api/user/${sessionID}`)
                .then(response => response.json())
                .then(json => {
                    const prevUser = json.prevSession[0]
                    if(prevUser){
                        setUser(prevUser.user)
                        setRoom(prevUser.room)
                        setLogin(true)
                        socket.emit('rejoin',{room:prevUser.room, user:prevUser.user, sessionID:sessionID})
                        setTimeout(() =>{getData(prevUser.room)}, 150) 
                    }
                })
            }
        }
        previousUser()

        return () => {
            socket.off('rejoin')
        }
    },[])


    React.useEffect(()=>{
        async function updateRoomUsers(){
            await fetch(`http://localhost:5000/api/roomUsers/${room}`)
            .then(response => response.json())
            .then(json => setRoomUsers(json.roomUsers))
            .catch(error => console.log(error))
        }

        socket.on('user_join', (data)=> {
            setMessages(prevMessages => {
                return [
                    ...prevMessages,
                    data
                ]
            })
            updateRoomUsers()
        })

        socket.on("received_message", (data) => {
            setMessages(prevMessages => {
                return [
                    ...prevMessages,
                    data
                ]
            })
        })

        socket.on('user_disconnect', (data)=>{
            setMessages(prevMessages => {
                return [
                    ...prevMessages,
                    data
                ]
            })
            updateRoomUsers()
        })

        return () => {
            socket.off("received_message") 
            socket.off('user_disconnect')
            socket.off('user_join')
            } // need this so it won't rerender again
    },[roomUsers,room])

    React.useEffect(()=>{
        ref.current?.scrollIntoView({
            behavior:'smooth',
            block: 'end',
            inline:'nearest'
        })
    },[messages])


    async function joinRoom(){
        // only allows if both are not empty
        if(user && room){
            /**
             * setting up sessionID to persist on refresh here on joining a room
             */
            if(!sessionStorage.getItem('sessionID')){
                const sessionID = uuidv4();
                sessionStorage.setItem('sessionID',sessionID)
            }

            socket.connect() // < -- dont think i need this?

            const date = new Date()

            let data = {
                sessionID:sessionStorage.getItem('sessionID'),
                user:user,
                room:room,
                time: `${date.getHours()}:${date.getMinutes()}`
            }
            socket.emit('join_room',data)
            setLogin(true)


            
            // getting existing users
            setTimeout(async () => {
                await fetch(`http://localhost:5000/api/roomUsers/${room}`)
                .then(response => response.json())
                .then(json => setRoomUsers(json.roomUsers))
                .catch(error => console.log(error))
    
                // getting existing messages
                await fetch(`http://localhost:5000/api/messages/${room}`)
                .then(response => response.json())
                .then(json => setMessages(prevMessages => {
                    return [...prevMessages,...json.roomMsg]
                }))
                .catch(err => console.log(err))                
            }, 150);

        }
    }

    function sendMsg(){
        if(currMessage){
            const date = new Date()

            const userData = {
                user:user,
                room:room,
                message:currMessage,
                time: `${date.getHours()}:${date.getMinutes()}`,
                date: `${date.getMonth()+1}/${date.getDate()}/${date.getFullYear()}`,
                sesssionID: sessionStorage.getItem('sessionID')
            }
            socket.emit('send_message', userData)
            setMessages(prevMessages => {
                return [...prevMessages,userData]
            })
            setCurrMessage('')
        }
    }

    function leaveRoom(){
        const id = sessionStorage.getItem('sessionID')
        socket.emit('leave-room',{room,id})
        setLogin(false)
        setRoom('')
        setUser('')
        setMessages([])
        setRoomUsers([])
    }
// <p key={index} className="own-message">{msg.user} [{msg.time}]: {msg.message}</p>

    const formatMessages = messages.map((msg,index) => 
    { 
        if(msg.user === user){
            return <>
                <div key={index} className="own-message">
                    <p className="timestamp">{msg.user} {msg.time}</p>
                    <p className="message-body">{msg.message}</p>
                </div>
            </>
        }
        else if(msg.user === 'ADMIN'){
            return <div key={index} className="admin-message">{msg.message}</div>
        }
        else{
            return <div key={index} className="other-message">
                    <p className="timestamp">{msg.user} {msg.time}</p>
                    <p className="message-body-other">{msg.message}</p>
                </div>
            
        }
    }
        
    )
    
    const formatRoomUsers = roomUsers.map((person,index) => {
        return <p key={index}>{person}</p>
    })


    return ( 
            <div className="background">
            <div className='title'>
                <h1>Chat App</h1>   
            </div>
            {!login? <Login setUser={setUser} setRoom={setRoom} joinRoom={joinRoom}/>
            :
            (
            <div className='homePage'>
                <div className='chat-section'>
                    <h3 className="room-title">Room: {room}</h3>
                    <div className="chat">
                        {formatMessages}
                        <div ref={ref}></div>
                    </div>
                    <div className="message-section">
                        <input type="text" placeholder="Message" className='message-input' value={currMessage} 
                        onChange={(event) => {setCurrMessage(event.target.value)}} onKeyDown={(event) =>{(event.key === 'Enter')&&sendMsg()}}></input>
                        <button onClick={sendMsg} className="basic-btn">Send</button>
                    </div>
                </div>
                <div className='user-section'>
                    <h4 className="user-title">Users</h4>
                    <div className="users">
                        <h5>{formatRoomUsers}</h5>
                    </div>
                        <button onClick={leaveRoom} className="basic-btn leave">Leave</button>
                </div>
            </div>
            )
            }
            </div>
    )
}