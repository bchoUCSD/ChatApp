import React from "react"
import Login from './components/Login.js'
import io from 'socket.io-client'

const socket = io.connect('http://localhost:5000')

export default function App(){

    const [user,setUser] = React.useState('')
    const [room, setRoom] = React.useState('')
    const [currMessage,setCurrMessage] = React.useState('')
    const [messages, setMessages] = React.useState([])
    const [login, setLogin] = React.useState(false)
    const date = new Date()

    React.useEffect(()=>{
        socket.on("received_message", (data) => {
            console.log(data.message)
            setMessages(prevMessages => {
                return [
                    ...prevMessages,
                    data
                ]
            })
        })
        // socket.on('user_disconnect', (data)=>{
        //     console.log(data);
        //     setMessages(prevMessages => {
        //         return [
        //             ...prevMessages,
        //             {
        //                 //trying to say if someone disconnected
        //                 user:'admin',
        //                 room:data.room,
        //                 time: `${date.getHours()}:${date.getMinutes()}`,
        //                 message: `${data.user} disconnected`
        //             }
        //         ]
        //     })
        // })

        return () => {socket.off("received_message")} // need this so it won't rerender again
    },[])

    function joinRoom(){
        // only allows if both are not empty
        if(user && room){
            const data = {
                user:user,
                room:room
            }
            socket.emit('join_room',data)
            setLogin(true)
        }
    }

    function sendMsg(){
        if(currMessage){
            const userData = {
                user:user,
                room:room,
                message:currMessage,
                time: `${date.getHours()}:${date.getMinutes()}`,
            }
            socket.emit('send_message', userData)
            setMessages(prevMessages => {
                return [...prevMessages,userData]
            })
            setCurrMessage('')
        }
    }

    const formatMessages = messages.map((msg,index) => { return <p key={index}>{msg.user}:{msg.message}</p>})

    return ( 
        <>
            <h1>Chat App</h1>
            {!login? <Login setUser={setUser} setRoom={setRoom} joinRoom={joinRoom}/>
            :
            (<div>
            <h3>Chat room id: {room}</h3>
            <input type="text" placeholder="Message" value={currMessage} 
            onChange={(event) => {setCurrMessage(event.target.value)}}></input>
            <button onClick={sendMsg}>Send</button>
            {formatMessages}
        </div>)
            }
        </>
    )
}