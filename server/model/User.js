const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    socketID:{type:String, required:true},
    sessionID:String,
    user:String,
    room:String,
    time:Number,
    lastMsg:Number,
    active:Boolean
})

const User = mongoose.model('User',userSchema) // first param is the collection it goes into, mongoose will auto make it lower case and plural
module.exports = User   