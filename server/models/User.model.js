const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    name: String,
    username: String,
    password: String,
    avatarUrl: String,
    msv: String,
    mail: String,
    listOfResults: Array  
})

module.exports = mongoose.model('User', UserSchema);