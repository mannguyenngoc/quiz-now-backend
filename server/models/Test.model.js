const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TestSchema = new Schema({
    questions: Array,
    code: String,
    link: String,
    title: String,
    requiredName: Boolean,
    requiredMsv: Boolean,
    knowTheResult: Boolean,
    numberOfEasyQuestions: Number,
    numberOfNormalQuestions: Number,
    numberOfHardQuestions: Number,
    time: Number,
    owner: String,
    source: String,
    listUserTake: String,
})

module.exports = mongoose.model('Test', TestSchema);