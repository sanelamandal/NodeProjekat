var express = require('express');
const db = require('../config/db');
var router = express.Router();
const pg = require('../config/db');
const {encrypt, decrypt} = require('../utils/passwordutils');
/* GET users listing. */
router.get('/login', function(req, res, next) {
  res.render('users/login')
});

router.get('/register', function(req, res) {
  res.render('users/register')
});

router.post('/register', function(req, res) {
  let {ime, prezime, email, password} = req.body
  password = encrypt(password);
  db.query('insert into Users (name, last_name, email, password) values($1,$2,$3,$4)', [ime, prezime, email, password])
    .then(() => {
      res.redirect('/users/register');
    })
    .catch(err => {
      console.log(err);
      res.redirect('/users/login');
    })
})

router.post('/login', function(req, response) {
  let {email, password} = req.body
  db.query('select id, email, password from Users where email = $1', [email])
    .then(res => {
      if(password == decrypt(res.rows[0].password)){
        response
          .cookie("id", encrypt(res.rows[0].id))
          .redirect('/restaurants/all_restaurants')
      }
    })
    .catch(err => {
      console.log(err);
    })
})

router.get('/all_users', function(req, res) {
    
  db.query('select name, last_name, email from users')
   .then(response => {
       const result = response.rows;
       res.render('users/all_users', {
           users: result
       })
   })
   .catch(err => {
       console.log(err);
   })
})
 
router.get('/logout', function(req,res) {
  res
    .clearCookie("id")
    .redirect('/users/login')

})
module.exports = router;
