const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BankSchema = new Schema({
    title: String,
    // id questions
    idQuestions: Array,
    // id test
    idTests: Array,
    // id owner
    idOwner: String
})

module.exports = mongoose.model('Bank', BankSchema);