const pool = require('../database'); 

const orderController = {
geOrders: (req, res) => {
  pool.query('SELECT * FROM orders', (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send('Server xatosi');
    } else {
      const orders = result.rows; 
      res.render('orders', { orders }); 
    }
  });
},

posOrders: (req, res) => {
  const { fio, region, phone } = req.body;
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
},
}

module.exports = orderController;