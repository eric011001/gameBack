const mongoose = require('mongoose');

const GamerSchema = mongoose.Schema({
    name: {
        type: String,
        require: true,
        trim: true
    },
    hits: {
        type: Number,
        default: 0
    },
    pieces: {
        type: Array
    }
});

module.exports = mongoose.model('Gamer',GamerSchema);