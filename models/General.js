const mongoose = require('mongoose');


const GeneralSchema = mongoose.Schema({
    active:{
        type: Boolean,
        require: true,
    },
    gamers:{ 
        type: Array
    },
    name: {
        type: String,
        require: true,
        trim: true
    },
    activeGamer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: ('Gamer'),
        default: null
    },
    winner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: ('Gamer'),
        default: null
    }
});

module.exports = mongoose.model('General', GeneralSchema);