const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BankSchema = new Schema({
    title: String,
    // id questions
    questions: Array,
    // id test
    test: Array,
    // id owner
    owner: String
})

module.exports = mongoose.model('Bank', BankSchema);