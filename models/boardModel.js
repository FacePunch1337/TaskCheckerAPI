const mongoose = require('mongoose');

// Схема для карточек
const cardSchema = mongoose.Schema({
    title: String,
   
});

// Схема для столбцов
const columnSchema = mongoose.Schema({
    title: String,
    cards: [cardSchema],
   
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
        
        
        
    }
);

const Board = mongoose.model('Board', boardSchema);

module.exports = Board;
