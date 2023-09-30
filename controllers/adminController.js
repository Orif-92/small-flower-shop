const bcrypt = require('bcryptjs');
const passport = require('passport');
const pool = require('../database'); 

const adminController = {
renderAdminDashboard: (req, res) => {
  res.render('register');
},

registerAdmin: async (req, res) => {
    const { firstName, lastName, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    pool.query('INSERT INTO users (first_name, last_name, email, password) VALUES ($1, $2, $3, $4)', [firstName, lastName, email, hashedPassword], (err, result) => {
        if (err) {
            return res.send('Xatolik yuz berdi');
        }
        res.redirect('/login');
    });
},

loginAdmin: (req, res) => {
    res.render('login');
},

authAdmin: passport.authenticate('local', {
  successRedirect: '/admin-dashboard',
  failureRedirect: '/login',
  failureFlash: true,
}),


showAdminDashboard: (req, res) => {
    if (req.isAuthenticated()) {
        res.render('admin-dashboard');
    } else {
        res.redirect('/login');
    }
},

showAdminDashboard: (req, res) => {
    res.render('admin-dashboard');
},

posAdminDashboard: (req, res) => {
    const { title, image, description, amount } = req.body;

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
},

showProductList: (req, res) => {
  pool.query('SELECT * FROM products', (err, result) => {
      if (err) {
          return res.send('Xatolik yuz berdi');
      }
      const products = result.rows;

      pool.query('SELECT COUNT(id) AS total_products FROM products', (err, result) => {
          if (err) {
              return res.send('Xatolik yuz berdi');
          }
          const totalProducts = result.rows[0].total_products;

          res.render('admin/products', { products, totalProducts });
      });
  });
},

showEditProduct: (req, res) => {
  const productId = req.params.productId;

  pool.query('SELECT * FROM products WHERE id = $1', [productId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Xatolik yuz berdi');
    }
    const product = result.rows[0];
    res.render('admin/edit-product', { product });
  });
},

updateProduct: (req, res) => {
  const productId = req.params.productId;
  const { title, image, description, amount } = req.body;

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
},


deleteProduct: (req, res) => {
  const productId = req.params.id;
  pool.query('DELETE FROM products WHERE id = $1', [productId], (err, result) => {
    if (err) {
      console.error(err);
      res.send('Xatolik yuz berdi');
    } else {
      res.redirect('/admin/products'); 
    }
  });
},


showAdminComments: (req, res) => {
  pool.query('SELECT * FROM comments', (err, result) => {
    if (err) {
      console.error('Komentariyalarni olishda xatolik yuz berdi:', err);
      return res.status(500).send('Server xatolik yuz berdi');
    }
    const comments = result.rows;
    res.render('admin/comments', { comments });
  });
},

deleteComments: (req, res) => {
  const commentId = req.params.id;
  pool.query('DELETE FROM comments WHERE id = $1', [commentId], (err, result) => {
    if (err) {
      console.error(err);
      res.send('Xatolik yuz berdi');
    } else {
      res.redirect('/admin/comments');
    }
  });
},



showNewProduct: (req, res) => {
  res.render('admin/new-product');
},

createProduct: (req, res) => {
  const { title, image, description, amount } = req.body;
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
},


showNewProduct: (req, res) => {
  res.render('admin/new-product');
},

createProduct: (req, res) => {
  const { title, image, description, amount } = req.body;
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
},

showAdminOrders: (req, res) => {
  pool.query('SELECT * FROM orders', (err, result) => {
      if (err) {
          return res.send('Xatolik yuz berdi');
      }
      const orders = result.rows;

      res.render('admin/orders', { orders });
  });
},

}
module.exports = adminController;