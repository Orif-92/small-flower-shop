const pool = require('../database');

const commentController = {
listComments: (req, res) => {
  pool.query('SELECT * FROM comments', (err, result) => {
    if (err) {
      return res.send('Xatolik yuz berdi');
    }
    const comments = result.rows;

    res.render('comments', { comments });
  });
},

addComment: (req, res) => {
  const { email, text } = req.body;
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
},
}

module.exports = commentController;