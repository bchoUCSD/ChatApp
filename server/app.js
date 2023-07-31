const express = require('express')
const app = express()
const http = require('http')
const {Server} = require('socket.io')
const cors =  require('cors')

const server = http.createServer(app)
app.use(cors())
const io = new Server(server, {
    cors: {
        origin:'http://localhost:3000',
        methods: ["GET", "POST"]
         // tell socketio that info will be coming from this port
        // 3000 is React's default port
    }
})

const users = {}


// built in events in socketio 
// socket is the specific user that is connected
io.on('connection', (socket) => { 
    console.log(`${socket.id} connected`)

    socket.on("join_room", (data) => {
        socket.join(data.room)
        console.log(`User: ${data.user} joined room: ${data.room}`)
        users[socket.id] = data
        console.log(users[socket.id].user);
    })

    socket.on('send_message', (data) => {
        console.log(data)
        socket.to(data.room).emit("received_message",data)
    })

    socket.on('disconnect',() =>{
        socket.emit('user_disconnect',users[socket.id])
    })
})


server.listen(5000,()=>{console.log('Started on port 5000...');})