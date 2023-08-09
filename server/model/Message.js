const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema({
    user:String,
    room:String,
    message:String,
    time:String,
    date:String
})

const Message = mongoose.model('Message',messageSchema)
module.exports = Message