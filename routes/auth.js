const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

const users = [];

// Ro'yhatdan o'tish sahifasini ko'rsatish
router.get('/register', (req, res) => {
  res.render('register'); 
});

// Ro'yhatdan o'tish formasini qabul qilish
router.post('/register', async (req, res) => {
  const { first_name, last_name, email, password } = req.body;

  // Parolni hash qilish
  const hashedPassword = await bcrypt.hash(password, 10);

  // Yana tekshirishlar (emailni tekshirish)
  const existingUser = users.find(user => user.email === email);
  if (existingUser) {
    return res.redirect('/register'); // Email mavjud bo'lsa qaytadan ro'yhatdan o'tish sahifasiga yo'naltirish
  }

  // Yana tekshirishlar (emailni tekshirish)
  const user = { first_name, last_name, email, password: hashedPassword };
  users.push(user);

  // Sessiyani yaratish
  req.session.user = user;

  res.redirect('/dashboard'); 
});

// Kirish sahifasini ko'rsatish
router.get('/login', (req, res) => {
    res.render('login'); 
  });
  
  // Kirish qabul qilish
  router.post('/login', async (req, res) => {
    const { email, password } = req.body;
  
    // Foydalanuvchini izlash
    const user = users.find(user => user.email === email);
  
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.redirect('/login'); // Kirish muvaffaqiyatsiz bo'lsa qaytadan kirish sahifasiga yo'naltirish
    }
  
    // Sessiyani yaratish
    req.session.user = user;
  
    res.redirect('/dashboard');
  });
  
  // Ro'yhatdan o'tish sahifasini ko'rsatish
router.get('/register', (req, res) => {
    res.render('register'); 
  });
  
  // Kirish sahifasini ko'rsatish
  router.get('/login', (req, res) => {
    res.render('login'); 
  });
  

module.exports = router;
