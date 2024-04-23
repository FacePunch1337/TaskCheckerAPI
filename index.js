    const express = require('express');
    const mongoose = require('mongoose');
    const User = require('./models/userModel.js');
    const bcrypt = require('bcrypt'); // Добавляем bcrypt
    const api = require('./routes/api.js')


    const app = express();
    const port = process.env.PORT || 8000;

    app.use(express.json());
    app.use("/api", api)
    app.use(express.urlencoded({ extended: false }));

    // Маршруты

    app.get('/', (req, res) =>{
        res.status(200).send("Hello from API!");
    });

    // Получить всех пользователей
    app.get('/users', async (req, res) => {
        try {
            const users = await User.find({});
            res.status(200).json(users);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });

    // Получить пользователя по ID
    app.get('/users/:id', async (req, res) => {
        try {
            const { id } = req.params;
            const user = await User.findById(id);
            res.status(200).json(user);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });

    // Создать нового пользователя
    app.post('/users', async (req, res) => {
        try {
            // Хэширование пароля перед сохранением в базу данных
            const hashedPassword = await bcrypt.hash(req.body.password, 10);
            const user = await User.create({ username: req.body.username, password: hashedPassword });
            res.status(200).json(user);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });

    // Обновить пользователя по ID
    app.put('/users/:id', async (req, res) => {
        try {
            const { id } = req.params;
            const user = await User.findByIdAndUpdate(id, req.body);
            if (!user) {
                return res.status(404).json({ message: `cannot find any user with ID ${id}` });
            }
            const updatedUser = await User.findById(id);
            res.status(200).json(updatedUser);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });

    // Удалить пользователя по ID
    app.delete('/users/:id', async (req, res) => {
        try {
            const { id } = req.params;
            const user = await User.findByIdAndDelete(id);
            if (!user) {
                return res.status(404).json({ message: `cannot find any user with ID ${id}` });
            }
            res.status(200).json(user);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });

    app.post('/login', async (req, res) => {
        try {
            console.log("Received login request:");
            console.log(req.body);
    
            const { username, password } = req.body;
            // Находим пользователя по имени пользователя
            const user = await User.findOne({ username });
            if (!user) {
                console.log("User not found");
                return res.status(404).json({ message: "Пользователь не найден" });
            }
            // Сравниваем предоставленный пароль с хэшированным паролем в базе данных
            const passwordMatch = await bcrypt.compare(password, user.password);
            if (!passwordMatch) {
                console.log("Incorrect password");
                return res.status(401).json({ message: "Неправильный пароль" });
            }
            // Аутентификация успешна
            console.log("Authentication successful");
            res.status(200).json({ message: "Успешная аутентификация" });
        } catch (error) {
            console.error("Error during login:", error);
            res.status(500).json({ message: error.message });
        }
    });
    
    


    mongoose.set("strictQuery", false);
    mongoose.connect('mongodb+srv://rezol1337:GVDGGnZDTVrT6zRi@cluster0.w3rkzvn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
        .then(() => {
            console.log('Connected to MongoDB');
            app.listen(port, () => {
                console.log(`Node API app is running on port 8000`);
            });
        })
        .catch((error) => {
            console.log(error);
        });
