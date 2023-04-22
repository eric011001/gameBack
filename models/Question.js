const mongoose = require('mongoose');

const QuestionSchema = mongoose.Schema({
    question: {
        type: String,
        require: true,
        trim: true
    },
    answers: {
        type: Array
    },
    correctAnswer: {
        type: String,
        require: true,
        trim: true
    }
})

module.exports = mongoose.model('Question', QuestionSchema);