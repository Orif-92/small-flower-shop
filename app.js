const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const passport = require('passport');
const exphbs = require('express-handlebars');
const path = require('path');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const session = require('express-session');
const flash = require('connect-flash');
const { Pool } = require('pg');

app.engine('.hbs', exphbs.engine({ defaultLayout: 'main', extname: '.hbs' })); 
app.set('view engine', '.hbs'); 
app.set('views', path.join(__dirname, 'views'));

// PostgreSQL bilan ishlash uchun bazani sozlash
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'users',
    password: '1234567',
    port: 5432, 
});

// Express.js middleware larni sozlash
app.use(express.urlencoded({ extended: false })); // Form o'zgaruvchilarini qabul qilish
app.use(session({
    secret: 'your-secret-key',
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// Passport.js ni sozlash
passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
}, (email, password, done) => {
    // Bazadan foydalanuvchi ma'lumotlarini izlash
    pool.query('SELECT * FROM users WHERE email = $1', [email], (err, result) => {
        if (err) {
            return done(err);
        }
        if (result.rows.length === 0) {
            return done(null, false, { message: 'Foydalanuvchi topilmadi' });
        }

        const user = result.rows[0];
        // Parolni solish
        bcrypt.compare(password, user.password, (bcryptErr, isMatch) => {
            if (bcryptErr) {
                return done(bcryptErr);
            }
            if (isMatch) {
                return done(null, user);
            } else {
                return done(null, false, { message: 'Noto\'g\'ri parol' });
            }
        });
    });
}));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    // Foydalanuvchi haqida ma'lumotlarni bazadan izlash
    pool.query('SELECT * FROM users WHERE id = $1', [id], (err, result) => {
        if (err) {
            return done(err);
        }
        const user = result.rows[0];
        done(null, user);
    });
});


app.get('/', (req, res) => {
  // Tovarlar ro'yhatini olish
  pool.query('SELECT * FROM products', (err, productResult) => {
    if (err) {
      return res.send('Xatolik yuz berdi');
    }
    const products = productResult.rows;

    res.render('products', { products });
  });
});

// Izohlar sahifasini ko'rsatish
app.get('/comments', (req, res) => {
  // Izohlar ro'yhatini olish
  pool.query('SELECT * FROM comments', (err, result) => {
    if (err) {
      return res.send('Xatolik yuz berdi');
    }
    const comments = result.rows;

    // Izohlar sahifasini chiqarish
    res.render('comments', { comments });
  });
});



// Izoh qoldirish
app.post('/add-comment', (req, res) => {
  const { email, text } = req.body;

  // Izohni PostgreSQL bazasiga qo'shish
  pool.query(
      'INSERT INTO comments (email, text) VALUES ($1, $2)',
      [email, text],
      (err, result) => {
          if (err) {
              console.error(err);
              res.send('Xatolik yuz berdi');
          } else {
              res.redirect('/comments');
          }
      }
  );
});

// Buyurtmalar sahifasini ko'rish
app.get('/orders', (req, res) => {
  // Ma'lumotlar bazasidan buyurtmalarni olish
  pool.query('SELECT * FROM orders', (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send('Server xatosi');
    } else {
      const orders = result.rows; // Buyurtmalar ro'yxati
      res.render('orders', { orders }); 
    }
  });
});

// Buyurtma qabul qilish
app.post('/orders', (req, res) => {
  const { fio, region, phone } = req.body;

  // Buyurtmani PostgreSQL bazasiga qo'shish
  pool.query(
      'INSERT INTO orders (fio, region, phone ) VALUES ($1, $2, $3)',
      [fio, region, phone],
      (err, result) => {
          if (err) {
              console.error(err);
              res.send('Xatolik yuz berdi');
          } else {
              res.redirect('/'); 
          }
      }
  );
}); 

// Buyurtma sahifasini ko'rsatish
app.get('/register', (req, res) => {
  res.render('register');
});


// Ro'yxatdan o'tish formani qabul qilish
app.post('/register', async (req, res) => {
    const { firstName, lastName, email, password } = req.body;

    // Parolni hash qilish
    const hashedPassword = await bcrypt.hash(password, 10);

    // Foydalanuvchini bazaga qo'shish
    pool.query('INSERT INTO users (first_name, last_name, email, password) VALUES ($1, $2, $3, $4)', [firstName, lastName, email, hashedPassword], (err, result) => {
        if (err) {
            return res.send('Xatolik yuz berdi');
        }
        res.redirect('/login');
    });
});

// Kirish sahifasini ko'rsatish
app.get('/login', (req, res) => {
    res.render('login');
});

// Kirish formani qabul qilish va autentifikatsiya
app.post('/login',
    passport.authenticate('local', {
        successRedirect: '/admin-dashboard', // Muvaffaqiyatli kirishdan so'ng qaysi sahifaga o'tilishi
        failureRedirect: '/login', // Xatolik bo'lganda qaysi sahifaga o'tilishi
        failureFlash: true
    })
);

// Admin panelini ko'rsatish (faqat autentifikatsiyadan o'tgan foydalanuvchilar uchun)
app.get('/admin-dashboard', (req, res) => {
    if (req.isAuthenticated()) {
        res.render('admin-dashboard');
    } else {
        res.redirect('/login');
    }
});

// Yangi Tovar sahifasini ko'rsatish
app.get('/admin-dashboard', (req, res) => {
    res.render('admin-dashboard');
});

// Yangi Tovar qo'shish
app.post('/admin-dashboard', (req, res) => {
    const { title, image, description, amount } = req.body;

    // Tovarni PostgreSQL bazasiga qo'shish
    pool.query(
        'INSERT INTO products (title, image, description, amount) VALUES ($1, $2, $3, $4)',
        [title, image, description, amount],
        (err, result) => {
            if (err) {
                console.error(err);
                res.send('Xatolik yuz berdi');
            } else {
                res.redirect('/admin/products');
            }
        }
    );
});

// Tovarlar ro'yhati va statistika
app.get('/admin/products', (req, res) => {
  // Tovarlar ro'yhatini olish
  pool.query('SELECT * FROM products', (err, result) => {
      if (err) {
          return res.send('Xatolik yuz berdi');
      }
      const products = result.rows;

      // Tovarlar statistikasini hisoblash
      pool.query('SELECT COUNT(id) AS total_products FROM products', (err, result) => {
          if (err) {
              return res.send('Xatolik yuz berdi');
          }
          const totalProducts = result.rows[0].total_products;

          // Tovarlar ro'yhatini va statistikani chiqarish
          res.render('admin/products', { products, totalProducts });
      });
  });
});

app.get('/admin/edit-product/:productId', (req, res) => {
  const productId = req.params.productId;

  // Tovarni tahrirlash sahifasini ko'rsatish
  pool.query('SELECT * FROM products WHERE id = $1', [productId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Xatolik yuz berdi');
    }
    const product = result.rows[0];
    res.render('admin/edit-product', { product });
  });
});

app.post('/admin/edit-product/:productId', (req, res) => {
  const productId = req.params.productId;
  const { title, image, description, amount } = req.body;

  // Tovarni o'zgartirish
  pool.query(
    'UPDATE products SET title = $1, image = $2, description = $3, amount = $4 WHERE id = $5',
    [title, image, description, amount, productId],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Xatolik yuz berdi');
      }
      res.redirect('/admin/products');
    }
  );
});


app.post('/admin/products/:id/delete', (req, res) => {
  const productId = req.params.id;

  // Mahsulotni ma'lumotlar bazasidan o'chiramiz (bu qismni o'zgartiring)
  pool.query('DELETE FROM products WHERE id = $1', [productId], (err, result) => {
    if (err) {
      console.error(err);
      res.send('Xatolik yuz berdi');
    } else {
      res.redirect('/admin/products'); // Mahsulotlar ro'yxatiga qaytish
    }
  });
});


app.get('/admin/comments', (req, res) => {
  // Komentariyalarni ma'lumotlar bazasidan olish
  pool.query('SELECT * FROM comments', (err, result) => {
    if (err) {
      console.error('Komentariyalarni olishda xatolik yuz berdi:', err);
      return res.status(500).send('Server xatolik yuz berdi');
    }
    const comments = result.rows;
    // Ma'lumotlarni admin panel sahifasiga o'tkazish
    res.render('admin/comments', { comments });
  });
});

app.post('/admin/comments/:id/delete', (req, res) => {
  const commentId = req.params.id; // "commentId" nomli o'zgaruvchi nomini "req.params.id" deb o'zgartirish kerak
  pool.query('DELETE FROM comments WHERE id = $1', [commentId], (err, result) => {
    if (err) {
      console.error(err);
      res.send('Xatolik yuz berdi');
    } else {
      res.redirect('/admin/comments'); // Mahsulotlar ro'yxatiga qaytish
    }
  });
});



app.get('/admin/new-product', (req, res) => {
  // Yangi tovar qo'shish sahifasini ko'rsatish
  res.render('admin/new-product');
});

app.post('/admin/products/new', (req, res) => {
  const { title, image, description, amount } = req.body;

  // Yangi tovar qo'shish
  pool.query(
    'INSERT INTO products (title, image, description, amount) VALUES ($1, $2, $3, $4)',
    [title, image, description, amount],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Xatolik yuz berdi');
      }
      res.redirect('/admin/products');
    }
  );
});


app.get('/admin/new-product', (req, res) => {
  // Yangi tovar qo'shish sahifasini ko'rsatish
  res.render('admin/new-product');
});

app.post('/admin/products/new', (req, res) => {
  const { title, image, description, amount } = req.body;

  // Yangi tovar qo'shish
  pool.query(
    'INSERT INTO products (title, image, description, amount) VALUES ($1, $2, $3, $4)',
    [title, image, description, amount],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Xatolik yuz berdi');
      }
      res.redirect('/admin/products');
    }
  );
});

// Buyurtmalar ro'yhati va buyurtmalarni qabul qilish
app.get('/admin/orders', (req, res) => {
  // Buyurtmalar ro'yhatini olish
  pool.query('SELECT * FROM orders', (err, result) => {
      if (err) {
          return res.send('Xatolik yuz berdi');
      }
      const orders = result.rows;

      // Buyurtmalar ro'yhatini ko'rsatish
      res.render('admin/orders', { orders });
  });
});



// Saytni eshitish uchun serverni boshlash
app.listen(port, () => {
    console.log(`Server ${port}-portda ishlayapti...`);
});
