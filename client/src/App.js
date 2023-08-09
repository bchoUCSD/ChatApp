import React from "react"
import Login from './components/Login.js'
import io from 'socket.io-client'

const socket = io.connect('http://localhost:5000', {
})

export default function App(){

    const [user,setUser] = React.useState('')
    const [room, setRoom] = React.useState('')
    const [currMessage,setCurrMessage] = React.useState('')
    const [messages, setMessages] = React.useState([])
    const [login, setLogin] = React.useState(false)
    const [roomUsers, setRoomUsers] = React.useState([])
    const date = new Date()



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

    async function joinRoom(){
        // only allows if both are not empty
        if(user && room){
            socket.connect()
            let data = {
                user:user,
                room:room,
                time: `${date.getMonth()+1}/${date.getDate()}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
            }
            await socket.emit('join_room',data)
            setLogin(true)
            
            // getting existing users
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
        }
    }

    function sendMsg(){
        if(currMessage){
            const userData = {
                user:user,
                room:room,
                message:currMessage,
                time: `${date.getHours()}:${date.getMinutes()}`,
                date: `${date.getMonth()+1}/${date.getDate()}/${date.getFullYear()}`
            }
            socket.emit('send_message', userData)
            setMessages(prevMessages => {
                return [...prevMessages,userData]
            })
            setCurrMessage('')
        }
    }

    function leaveRoom(){
        socket.emit('leave-room',room)
        setLogin(false)
        setRoom('')
        setUser('')
        setMessages([])
        setRoomUsers([])
    }

    const formatMessages = messages.map((msg,index) => 
    { return <p key={index}>{msg.user} [{msg.time}]: {msg.message}</p>})

    const formatRoomUsers = roomUsers.map((person,index) => {
        return <p key={index}>{person}</p>
    })


    return ( 
        <>
            <h1>Chat App</h1>
            {!login? <Login setUser={setUser} setRoom={setRoom} joinRoom={joinRoom}/>
            :
            (<div>
                <h3>Chat room id: {room}</h3>
                {formatMessages}
                <h4>Users: {formatRoomUsers}</h4>
                <input type="text" placeholder="Message" value={currMessage} 
                onChange={(event) => {setCurrMessage(event.target.value)}} onKeyDown={(event) =>{(event.key === 'Enter')&&sendMsg()}}></input>
                <button onClick={sendMsg} >Send</button>
                <button onClick={leaveRoom}>Leave</button>
            </div>)
            }
        </>
    )
}