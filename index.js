const express = require('express');
const mongoose = require('mongoose');
const User = require('./models/userModel.js');
const admin = require('firebase-admin');
const bcrypt = require('bcrypt');
const multer = require('multer');
const api = require('./routes/api.js');
const storage = require("./firebase.js");
const storageRef = require("firebase/storage");
const bucket = require("./firebase.js");
const app = express();
const port = process.env.PORT || 8000;


const multer = require('multer');
const upload = multer();

app.use(express.json());
app.use("/api", api);
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
// Инициализация Firebase Admin SDK



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
    // Проверяем, существует ли уже пользователь с заданным именем
    const existingUser = await User.findOne({ username: req.body.username });
    if (existingUser) {
      return res.status(400).json({ message: "Пользователь с таким именем уже существует" });
    }

    // Хеширование пароля перед сохранением в базу данных
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = await User.create({ username: req.body.username, email: req.body.email, password: hashedPassword });

    // Аутентификация успешна, возвращаем данные пользователя, как в методе /login
    res.status(200).json({ message: "Успешная регистрация", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Получить пользователя по его ID
app.get('/users/:userId', async (req, res) => {
    try {
      const userId = req.params.userId;
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "Пользователь не найден" });
      }
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

// Загрузить файл пользователя


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
    // Аутентификация успешна, возвращаем данные пользователя
    res.status(200).json({ message: "Успешная аутентификация", user });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: error.message });
  }
});

// Загрузить файл пользователя в Firestore
app.post('/users/:userId/avatar', upload.single('avatar'), async (req, res) => {
    try {
      const userId = req.params.userId;
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "Пользователь не найден" });
      }
      if (!req.file) {
        return res.status(400).json({ message: "Файл не был загружен" });
      }
  
      const avatarFile = req.file;
      const imagePath = `users/${userId}/avatar/${avatarFile.originalname}`;
  
      // Загружаем файл в Firebase Storage
      const file = bucket.file(imagePath);
      await file.save(avatarFile.buffer, {
        metadata: {
          contentType: avatarFile.mimetype
        }
      });
  
      // Получаем URL загруженного файла
      const imageUrl = `https://storage.googleapis.com/${bucket.name}/${imagePath}`;
  
      // Сохраняем URL в базе данных
      user.avatar = imageUrl;
      await user.save();
  
      res.status(200).json({ message: "Avatar uploaded successfully", imageUrl });
    } catch (error) {
      console.error("Error uploading avatar:", error);
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