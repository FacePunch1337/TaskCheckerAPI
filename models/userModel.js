const mongoose = require('mongoose');

const userSchema = mongoose.Schema(
    {
        username: {
            type: String,
            required: [true, "Please enter a username"],
            unique: true
        },
        email: {
            type: String,
            required: [true, "Please enter an email"],
            unique: true
        },
        password: {
            type: String,
            required: [true, "Please enter a password"]
        },
        avatarURL: {
            type: String // Путь к аватару пользователя
        },
        avatarFileName: {
            type: String // Путь к аватару пользователя
        }
        
        
    },
    {
        timestamps: true
    }
);

const User = mongoose.model('User', userSchema);

module.exports = User;
