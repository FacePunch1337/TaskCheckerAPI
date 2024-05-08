const mongoose = require('mongoose');

const boardSchema = mongoose.Schema(
    {
        title: {
            type: String
        }
        
        
        
    }
);

const Board = mongoose.model('Board', boardSchema);

module.exports = Board;
