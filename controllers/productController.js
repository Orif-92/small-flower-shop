const pool = require('../database'); 

const productController = {
listProducts: (req, res) => {
  pool.query('SELECT * FROM products', (err, productResult) => {
    if (err) {
      return res.send('Xatolik yuz berdi');
    }
    const products = productResult.rows;

    res.render('products', { products });
  });
},
}

module.exports = productController;