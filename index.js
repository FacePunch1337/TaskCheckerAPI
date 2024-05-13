const express = require('express');
const mongoose = require('mongoose');
const firebase = require('firebase-admin');
const User = require('./models/userModel.js');
const Board = require('./models/boardModel.js');
const bcrypt = require('bcrypt');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const { storage } = require("./firebase.js"); // Импортируем объект storage из firebase.js
const app = express();
const port = process.env.PORT || 8000;

const upload = multer();

app.use(express.json());
app.use(express.urlencoded({ extendsed: false }));

const defaultAvatarURL = "https://firebasestorage.googleapis.com/v0/b/taskcheker-39fd8.appspot.com/o/avatars%2FdefaultAvatar.png?alt=media&token=2dc441da-b359-4293-9796-81c838d2c2be";
const avatarFileName = "defaultAvatar.png";


// Получить всех пользователей
app.get('/users', async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// Получить все доски
app.get('/boards', async (req, res) => {
  try {
    const boards = await Board.find({});
    res.status(200).json(boards);
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
    
    // Создание пользователя с указанием имени файла аватара
    const user = await User.create({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
      avatarURL: defaultAvatarURL,
      avatarFilename: avatarFileName, // Используем переданное имя файла
    });

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

        // Генерируем уникальное имя файла
        const fileName = `${uuidv4()}-${req.file.originalname}`;
        
        // Путь куда сохранить файл в Firebase Storage
        const filePath = `avatars/${fileName}`;

        // Загружаем файл в Firebase Storage
        const fileUploadTask = await storage.ref(filePath).put(req.file.buffer, {
            contentType: req.file.mimetype,
        });

        // Получаем URL загруженного файла
        const imageUrl = await fileUploadTask.ref.getDownloadURL();
        
        
        User.avatarFilename = fileName;

        // Возвращаем данные пользователя и URL загруженного изображения
        res.status(200).json({ message: 'Файл успешно загружен', imageUrl, fileName});
    } catch (error) {
        console.error('Ошибка при загрузке файла:', error);
        res.status(500).json({ message: error.message });
    }
});


 

// Обработчик для удаления изображения

/*app.delete('/deleteAvatar', async (req, res) => {
  try {
    const avatarUrl = decodeURIComponent(req.query.avatarUrl); // Декодируем URL, если он содержит специальные символы
    // Получаем ссылку на файл в Firebase Storage
    const fileRef = storage.refFromURL(avatarUrl);
    
    // Удаляем файл
    await fileRef.delete();

    res.status(200).json({ message: "Аватар успешно удален" });
  } catch (error) {
    console.error('Ошибка при удалении аватара:', error);
    res.status(500).json({ message: error.message });
  }
});*/

// Обработчик для удаления изображения
app.delete('/deleteAvatar', async (req, res) => {
  try {
    const avatarFileName = req.query.avatarFilename; // Получаем имя файла аватара из запроса

    // Получаем ссылку на файл в Firebase Storage
    const fileRef = storage.ref('avatars/' + avatarFileName);
    
    // Удаляем файл
    await fileRef.delete();

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
    const { avatarUrl, avatarFilename } = req.body;

    // Находим пользователя по его ID и обновляем данные
    const updatedUser = await User.findByIdAndUpdate(userId, {
      avatarURL: avatarUrl,
      avatarFilename: avatarFilename
    }, { new: true });

    if (!updatedUser) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }

    res.status(200).json({ message: "Данные успешно обновлены", user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/boards/', async (req, res) => {
  try {


    const newBoard = await Board.create({
      title: req.body.title,
      owner: req.body.owner
    });


    res.status(201).json({ message: "Доска успешно создана", newBoard });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/boards/:owner', async (req, res) => {
  try {
    const owner = req.params.owner;
    const boards = await Board.find({ owner: owner });
    if (!boards || boards.length === 0) {
      return res.status(404).json({ message: "Доски не найдены" });
    }
    res.status(200).json(boards);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/board/:boardId', async (req, res) => {
  try {
    const boardId = req.params.boardId;
    const board = await Board.findById(boardId);
    if (!board) {
      return res.status(404).json({ message: "Доска не найдена" });
    }
    res.status(200).json(board);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


app.post('/boards/:boardId/columns', async (req, res) => {
  try {
    const boardId = req.params.boardId;
    const board = await Board.findById(boardId);
    if (!board) {
      return res.status(404).json({ message: "Доска не найдена" });
    }

    // Создаем новую колонку
    const newColumn = {
      title: req.body.title,
      cards: []
      // Можете добавить другие поля колонки, если нужно
    };

    // Добавляем новую колонку в массив колонок доски
    board.columns.push(newColumn);

    // Сохраняем изменения в базе данных
    await board.save();

    res.status(201).json({ message: "Колонка успешно добавлена", newColumn });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/boards/:boardId/columns/:columnId/cards', async (req, res) => {
  try {
    const boardId = req.params.boardId;
    const columnId = req.params.columnId;

    // Находим доску по её ID
    const board = await Board.findById(boardId);
    if (!board) {
      return res.status(404).json({ message: "Доска не найдена" });
    }

    // Находим колонку по её ID
    const column = board.columns.id(columnId);
    if (!column) {
      return res.status(404).json({ message: "Колонка не найдена" });
    }

    // Создаем новую карточку
    const newCard = {
      title: req.body.title,
      // Можете добавить другие поля карточки, если нужно
    };

    // Добавляем новую карточку в массив карточек колонки
    column.cards.push(newCard);

    // Сохраняем изменения в базе данных
    await board.save();

    res.status(201).json({ message: "Карточка успешно добавлена", newCard });
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