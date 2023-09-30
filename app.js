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
const pool = require('./database'); 

app.use(express.urlencoded({ extended: false })); 
app.use(session({
    secret: 'your-secret-key',
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
}, (email, password, done) => {
    pool.query('SELECT * FROM users WHERE email = $1', [email], (err, result) => {
        if (err) {
            return done(err);
        }
        if (result.rows.length === 0) {
            return done(null, false, { message: 'Foydalanuvchi topilmadi' });
        }

        const user = result.rows[0];
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
    pool.query('SELECT * FROM users WHERE id = $1', [id], (err, result) => {
        if (err) {
            return done(err);
        }
        const user = result.rows[0];
        done(null, user);
    });
});

app.use(express.static('public'));
app.engine('.hbs', exphbs.engine({ defaultLayout: 'main', extname: '.hbs' }));
app.set('view engine', '.hbs');
app.set('views', path.join(__dirname, 'views'));

const adminRoutes = require('./routes/admin');
const commentRoutes = require('./routes/comment');
const productRoutes = require('./routes/product');
const orderRoutes = require('./routes/order');

app.use('/', productRoutes);
app.use('/', commentRoutes);
app.use('/', adminRoutes);
app.use('/', orderRoutes);


app.listen(port, () => {
    console.log(`Server ${port}-portda ishlayapti...`);
});
