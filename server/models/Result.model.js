const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ResultSchema = new Schema({
    idTest: String,
    idUser: String,
    userAnswers: Array,
    numberOfEasyQuestions: Number,
    numberOfNormalQuestions: Number,
    numberOfHardQuestions: Number,
    score: Number,
    count: Number,
    infos: Array,
    time: Number,
})

module.exports = mongoose.model('Result', ResultSchema);