const express = require('express');
const mongoose = require('mongoose');
const User = require('./models/userModel.js');
const bcrypt = require('bcrypt');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const { storage } = require("./firebase.js"); // Импортируем объект storage из firebase.js
const app = express();
const port = process.env.PORT || 8000;

const upload = multer();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const defaultAvatarURL = "https://firebasestorage.googleapis.com/v0/b/taskcheker-39fd8.appspot.com/o/avatars%2FdefaultAvatar.png?alt=media&token=edd86f64-41fa-4c51-9320-f41ebc99f78a";

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
    // Проверка существует ли уже пользователь с заданным именем
    const existingUser = await User.findOne({ username: req.body.username });
    if (existingUser) {
      return res.status(400).json({ message: "Пользователь с таким именем уже существует" });
    }

    // Хеширование пароля перед сохранением в базу данных
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = await User.create({ username: req.body.username, email: req.body.email, password: hashedPassword, avatarURL: defaultAvatarURL });

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
  

  app.post('/upload', upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'Файл не был загружен' });
      }
  
      // Получаем информацию о пользователе из запроса
      const user = req.body.user;
  
      // Генерируем уникальное имя файла
      const fileName = `${req.file.originalname}`;
      
      // Путь куда сохранить файл в Firebase Storage
      const filePath = `avatars/${fileName}`;
  
      // Загружаем файл в Firebase Storage
      const fileUploadTask = await storage.ref(filePath).put(req.file.buffer, {
        contentType: req.file.mimetype,
      });
  
      // Получаем URL загруженного файла
      const imageUrl = await fileUploadTask.ref.getDownloadURL();
  
      // Возвращаем данные пользователя и URL загруженного изображения
      res.status(200).json({ message: 'Файл успешно загружен', imageUrl });
    } catch (error) {
      console.error('Ошибка при загрузке файла:', error);
      res.status(500).json({ message: error.message });
    }
  });

  // Получение ссылки на хранилище


// Обработчик для удаления изображения
app.delete('/deleteAvatar', async (req, res) => {
    try {
        const avatarUrl = req.query.avatarUrl;

        // Получаем имя файла из URL
        const fileName = avatarUrl.split('/').pop();

        // Путь к файлу в Firebase Storage
        const filePath = `avatars/${fileName}`;

        await storage.ref(filePath).delete();

        res.status(200).json({ message: "Аватар успешно удален" });
    } catch (error) {
        console.error('Ошибка при удалении аватара:', error);
        res.status(500).json({ message: error.message });
    }
});

  // Обновить данные пользователя
app.put('/users/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const { avatarUrl } = req.body;

    // Находим пользователя по его ID и обновляем URL аватара
    const updatedUser = await User.findByIdAndUpdate(userId, { avatarURL: avatarUrl }, { new: true });
    if (!updatedUser) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }

    res.status(200).json({ message: "Данные успешно обновлены", user: updatedUser });
  } catch (error) {
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
