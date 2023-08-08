const express = require('express')
const app = express()
const http = require('http')
const {Server} = require('socket.io')
const cors =  require('cors')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
dotenv.config()
const User = require('./model/User')

const server = http.createServer(app)
app.use(cors())
app.use(express.json())

const io = new Server(server, {
    cors: {
        origin:'http://localhost:3000',
        methods: ["GET", "POST"]
         // tell socketio that info will be coming from this port
        // 3000 is React's default port
    }
})

/**
 * holds the current users in all rooms, will eventually replace with database
 * with schema of user,room,socketid
 */
let users = {}


// built in events in socketio 
// socket is the specific user that is connected
io.on('connection', (socket) => { 
    console.log(`${socket.id} connected`)

    socket.on("join_room", (data) => {
        socket.join(data.room)
        const newUser = {
            user:'ADMIN',
            room:data.room,
            message: `${data.user} joined`,
            time:data.time
        } // send back to client to announce user join

        users[socket.id] = data // adding user to the list of active users
        
        socket.to(data.room).emit('user_join',newUser) // notify active users in room new user join
        

        // -------------------------------------------------- dont touch above ^^^^

        console.log(`User: ${data.user} joined room: ${data.room}`)
    })

    socket.on('send_message', (data) => {
        console.log(data)
        socket.to(data.room).emit("received_message",data)
    })

    socket.on('leave-room', (data)=>{
        if(users[socket.id]){ // if in a room then delete them
            let userLeft = users[socket.id]
            console.log(userLeft);
            delete users[socket.id]
            userLeft.message = `${userLeft.user} disconnected`
            userLeft.user = 'ADMIN'
            socket.to(userLeft.room).emit('user_disconnect',userLeft)
            console.log(`${userLeft.message}`);
        }
        socket.leave(data);
    })

    socket.on('disconnect',() =>{
        if(users[socket.id]){ // if in a room then delete them
            let userLeft = users[socket.id]
            console.log(userLeft);
            delete users[socket.id]
            userLeft.message = `${userLeft.user} disconnected`
            userLeft.user = 'ADMIN'
            socket.to(userLeft.room).emit('user_disconnect',userLeft)
            console.log(`${userLeft.message}`);
        }
        else{
            console.log(`${socket.id} disconnected`);
        }
    })
})

app.get('/api/roomUsers/:roomID', (req,res)=>{
    const roomNum = req.params.roomID
    const asArray = Object.values(users)
    let roomUsers = []
    for(let i = 0; i < asArray.length;i++){
        if(asArray[i].room === roomNum){
            roomUsers.push(asArray[i].user)
        }
    }
    const inObject = {roomUsers}
    res.status(200).json({roomUsers})
})


async function start(){
    try {
        const URI = process.env.MONGO_URI
        await mongoose.connect(URI)
        console.log('Connected to DB')
        server.listen(5000,()=>{console.log('Started on port 5000...')})

    } catch (error) { 
        console.log(error)
    }
}
start()
const date = new Date()

const testing = new User({
    user:'testing',
    room:'123',
    time:`${date.getMonth()+1}/${date.getDate()}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
})

// testing.save();
async function all(){
    const allUsers = await User.find({})
    console.log(allUsers);
}
all()
