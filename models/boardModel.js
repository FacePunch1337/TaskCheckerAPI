const mongoose = require('mongoose');


const cardSchema = mongoose.Schema({
    title: String,
    executor: String,
    startDate: String,
    endDate: String
   
});

const columnSchema = mongoose.Schema({
    title: String,
    cards: [cardSchema],
   
});

const memberSchema = mongoose.Schema({
    userId: String
});


const boardSchema = mongoose.Schema(
    {
        title: {
            type: String
        },
        owner: {
            type: String
        },
        columns: [columnSchema],
        members: [memberSchema]
        
        
    }
);

const Board = mongoose.model('Board', boardSchema);

module.exports = Board;
