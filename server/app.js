const express = require('express')
const app = express()
const http = require('http')
const {Server} = require('socket.io')
const cors =  require('cors')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
dotenv.config()
const User = require('./model/User')
const Message = require('./model/Message')

const server = http.createServer(app)
app.use(cors())
app.use(express.json())

const io = new Server(server, {
    cors: {
        origin:'http://localhost:3000',
        methods: ["GET", "POST"]
         // tell socketio that info will be coming from default react port(3000)
    }
})

// socket is the specific user that is connected
io.on('connection', (socket) => { 

    socket.on("join_room", async (data) => {
        socket.join(data.room)

        const date = new Date()
        const joinMessage = new Message({
            user:'ADMIN',
            room:data.room,
            message:`${data.user} joined`,
            time: `${date.getHours()}:${date.getMinutes()}`,
            date: `${date.getMonth()+1}/${date.getDate()}/${date.getFullYear()}`
        })
        await joinMessage.save()

        await User.create({
            sessionID:data.sessionID,
            socketID:socket.id,
            user:data.user,
            room: data.room,
            time: Date.now(),
            lastMsg: Date.now(),
            active:true
        })  
        
        socket.to(data.room).emit('user_join',joinMessage)
    })

    socket.on('rejoin', async (data) => {
        socket.join(data.room)

        const date = new Date()
        const joinMessage = new Message({
            user:'ADMIN',
            room:data.room,
            message:`${data.user} rejoined`,
            time: `${date.getHours()}:${date.getMinutes()}`,
            date: `${date.getMonth()+1}/${date.getDate()}/${date.getFullYear()}`
        })
        await joinMessage.save()

        await User.findOneAndUpdate({sessionID:data.sessionID},{time: Date.now(), active:true, socketID:socket.id})

        socket.to(data.room).emit('user_join',joinMessage)
    })


    socket.on('send_message', async (data) => {
        await Message.create({
            user:data.user,
            room:data.room,
            message:data.message,
            time: data.time,
            date: data.date
        })
        await User.findOneAndUpdate({sessionID:data.sessionID},{lastMsg:Date.now()})
        socket.to(data.room).emit("received_message",data)
    })

    socket.on('leave-room', async (data)=>{
        
        // find in database if found delete it
        const inDB = await User.findOne({sessionID:data.id}).exec()
        if(inDB){
            const date = new Date()
            await User.deleteOne({sessionID:data.id})
            const userLeft = new Message({
                user:'ADMIN',
                room: inDB.room,
                actual: inDB.user,
                message: `${inDB.user} disconnected`,
                time: `${date.getHours()}:${date.getMinutes()}`,
                date: `${date.getMonth()+1}/${date.getDate()}/${date.getFullYear()}`
            })
            await userLeft.save()
            socket.to(userLeft.room).emit('user_disconnect',userLeft)
        }
    
        socket.leave(data.room);

        // if last user than delete all messages in room
        const numInRoom = await User.find({room:data.room, active:true}).exec()
        if(numInRoom.length === 0){
            // delete all messages with room num
            await Message.deleteMany({room:data.room}).exec()
        }

    })
    
    /**
     * Disconnect is the socket itself closing initiated with browswer close
     */ 
    
    socket.on('disconnect',async () =>{
        const inDB = await User.findOne({socketID: socket.id}).exec()
        if(inDB){
            const date = new Date()
            const userLeft = new Message({
                user:'ADMIN',
                room: inDB.room,
                message: `${inDB.user} disconnected`,
                time: `${date.getHours()}:${date.getMinutes()}`,
                date: `${date.getMonth()+1}/${date.getDate()}/${date.getFullYear()}`
            })
            await userLeft.save()
            await User.findOneAndUpdate({socketID:socket.id},{active:false})
            const lastOne = await User.find({room:inDB.room, active:true})
            if(lastOne.length !== 0){
                socket.to(userLeft.room).emit('user_disconnect',userLeft)
            }
        }
    })
})

app.get('/api/roomUsers/:roomID', async (req,res)=>{

    const inRoom = await User.find({room: req.params.roomID, active:true}).exec()
    let roomUsers = []
    for(let i = 0; i < inRoom.length;i++){
        roomUsers.push(inRoom[i].user)
    }
    res.status(200).json({roomUsers})
})

app.get('/api/messages/:roomID', async (req,res) => {
    const roomMsg = await Message.find({room: req.params.roomID}).exec()
    res.status(200).json({roomMsg})
})

app.get('/api/user/:sessionID', async (req,res) => {
    const prevSession = await User.find({sessionID: req.params.sessionID}).exec()
    res.status(200).json({prevSession})
})

app.get('/api/rooms', async (req,res) => {
    const rooms = await User.distinct('room')
    const listOfRooms = []
    for(let i = 0; i < rooms.length; i++){
        listOfRooms[i] = rooms[i]
    }
    res.status(200).json({listOfRooms})
})



async function start(){
    try {
        const URI = process.env.MONGO_URI
        await mongoose.connect(URI)
        console.log('Connected to DB')
        server.listen(5000,()=>{console.log('Started on port 5000...')})
        let min = 10
        let interval = min * 60 * 1000
        setInterval(async () => {
            console.log(`here every ${min} min`);
            /**
             * Deletes users after 10 minutes of not sending a message, deletes room if no one in room
             */
            const rooms = await Message.distinct('room')
            const allUsers = await User.find({})
            for(let i = 0; i < allUsers.length;i++){
                const now = Date.now()
                if(now - allUsers[i].lastMsg >= min){
                    await User.findOneAndDelete({sessionID:allUsers[i].sessionID})
                }
            }

            await User.deleteMany({active:false})
            for(let i = 0; i < rooms.length;i++){
                const room = await User.find({room:rooms[i]})
                if(room.length === 0){
                    await Message.deleteMany({room:rooms[i]})
                }
            }
        },interval)

    } catch (error) { 
        console.log(error)
    }
}
start()
