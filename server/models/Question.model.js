const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const QuestionSchema = new Schema({
    title: String,
    answers: Array,
    level: String,
    isManyAnswers: Boolean,
    // id bank
    idBank: String
})

module.exports = mongoose.model('Question', QuestionSchema);