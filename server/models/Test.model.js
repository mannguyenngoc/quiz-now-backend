const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TestSchema = new Schema({
    questions: Array,
    code: String,
    link: String,
    title: String,
    requireInfo: Array,
    knowTheResult: Boolean,
    numberOfEasyQuestions: Number,
    numberOfNormalQuestions: Number,
    numberOfHardQuestions: Number,
    time: Number,
    source: String,
})

module.exports = mongoose.model('Test', TestSchema);