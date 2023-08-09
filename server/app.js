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

const date = new Date()

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

    socket.on("join_room", async (data) => {
        socket.join(data.room)
        const newUser = {
            user:'ADMIN',
            room:data.room,
            message: `${data.user} joined`,
            time:data.time
        } // send back to client to announce user join

        users[socket.id] = data // adding user to the list of active users
        // attempting to add to database
        const dbUser = await User.create({
            socketID:socket.id,
            user:data.user,
            room: data.room,
            time: data.time
        })  

        socket.to(data.room).emit('user_join',newUser) // notify active users in room new user join

        // -------------------------------------------------- dont touch above ^^^^

        console.log(`User: ${data.user} joined room: ${data.room}`)
    })

    socket.on('send_message', async (data) => {
        await Message.create({
            user:data.user,
            room:data.room,
            message:data.message,
            time: data.time,
            date: data.date
        })
        console.log(data)
        socket.to(data.room).emit("received_message",data)
    })

    socket.on('leave-room', async (data)=>{
        
        
        // find in database if found delete it
        const inDB = await User.findOne({socketID: socket.id}).exec()
        if(inDB){
            await User.deleteOne({socketID: socket.id})
            // printing allUsers
            const allUsers = await User.find({})
            //console.log(allUsers);
        }
        
        
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

        // if last user than delete all messages in room
        const numInRoom = await User.find({room:data}).exec()
        if(numInRoom.length === 0){
            // delete all messages with room num
            await Message.deleteMany({room:data}).exec()
        }

    })
    
    /**
     * the above two methods are very similar because this one is the browser closing while which disconnects
     * the actual socket while the above is for when the user wants to switch rooms.  
     */ 
    
    socket.on('disconnect',async () =>{

        // find in database if found delete it
        const inDB = await User.findOne({socketID: socket.id}).exec()
        if(inDB){
            const room = inDB.room
            await User.deleteOne({socketID: socket.id})
            // if last user than delete all messages in room
            const numInRoom = await User.find({room:room}).exec()
            if(numInRoom.length === 0){
                // delete all messages with room num
                await Message.deleteMany({room:room}).exec()
            }
        }


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

app.get('/api/roomUsers/:roomID', async (req,res)=>{

    const inRoom = await User.find({room: req.params.roomID}, 'user').exec()
    //console.log(inRoom);
    let roomUsers = []
    for(let i = 0; i < inRoom.length;i++){
        roomUsers.push(inRoom[i].user)
    }
    //console.log(roomUsers)
    res.status(200).json({roomUsers})
})

app.get('/api/messages/:roomID', async (req,res) => {
    const roomMsg = await Message.find({room: req.params.roomID}).exec()
    res.status(200).json({roomMsg})
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


async function all(){
    // try {
    //     const testing = new User({
    //         socketID:'abc456',
    //         user:'testing',
    //         room:'123',
    //         time:`${date.getMonth()+1}/${date.getDate()}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
    //     })
    //     await testing.save()
    // } catch (error) {
    //     console.log(error);
    // }
    const allUsers = await User.find({})
    console.log(allUsers);
}
