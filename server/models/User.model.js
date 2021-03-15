const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const hashPassword = require("../../functions/hashPassword");

const UserSchema = new Schema({
    name: String,
    username: String,
    password: String,
    avatarUrl: String,
    msv: String,
    mail: String,
    // listOfResults: Array  
})
UserSchema.methods.validatePassword = function(password) {
    const hash = hashPassword(password);

    return this.password === hash;
}
module.exports = mongoose.model('User', UserSchema);