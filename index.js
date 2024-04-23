const express = require('express');
const mongoose = require('mongoose');
const User = require('./models/userModel.js');
const bcrypt = require('bcrypt');
const api = require('./routes/api.js');

const app = express();
const port = process.env.PORT || 8000;

app.use(express.json());
app.use("/api", api);
app.use(express.urlencoded({ extended: false }));

// Маршруты

// Получить всех пользователей
app.get('/users', async (req, res) => {
    try {
        const users = await User.find({});
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Создать нового пользователя
app.post('/users', async (req, res) => {
    try {
        // Хеширование пароля перед сохранением в базу данных
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const user = await User.create({ username: req.body.username, password: hashedPassword });
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Аутентификация пользователя
app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        // Находим пользователя по имени пользователя
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: "Пользователь не найден" });
        }
        // Сравниваем предоставленный пароль с хэшированным паролем в базе данных
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: "Неправильный пароль" });
        }
        // Аутентификация успешна
        res.status(200).json({ message: "Успешная аутентификация" });
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ message: error.message });
    }
});

// Подключение к MongoDB
mongoose.connect('mongodb+srv://rezol1337:GVDGGnZDTVrT6zRi@cluster0.w3rkzvn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
    .then(() => {
        console.log('Connected to MongoDB');
        app.listen(port, () => {
            console.log(`Node API app is running on port ${port}`);
        });
    })
    .catch((error) => {
        console.log(error);
    });
