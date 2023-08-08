const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    user:String,
    room:String,
    time:String
})

const User = mongoose.model('User',userSchema) // first param is the collection it goes into, mongoose will auto make it lower case and plural
module.exports = User