const { Int32 } = require('mongodb');
const mongoose = require('mongoose');

const taskSchema = mongoose.Schema({
    description: String,
    checked: Boolean
});

const commentSchema = mongoose.Schema({
    text: String,
    memberId: String,
    time: String,
    index: String
    
});
const cardSchema = mongoose.Schema({
    title: String,
    description: String,
    executor: String,
    startDate: String,
    endDate: String,
    tasks: [taskSchema],
    comments: [commentSchema]
   
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
