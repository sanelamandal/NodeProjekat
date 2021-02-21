var express = require('express');
const db = require('../config/db');
var router = express.Router();
const cryptor = require('../config/cryptor');
const {isAdmin} = require('../utils/isAdmin');
/* GET users listing. */

router.get('/login', function(req, res, next) {
  res.render('users/login')
});

router.get('/register', function(req, res) {
  res.render('users/register')
});

router.post('/register', function(req, res) {
  let {ime, prezime, email, password} = req.body
  password = cryptor.encrypt(password);
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
      if(password == cryptor.decrypt(res.rows[0].password)){
        response
          .cookie("id", cryptor.encrypt(res.rows[0].id))
          .redirect('/restaurants/all_restaurants')
      }
    })
    .catch(err => {
      console.log(err);
    })
})

router.get('/all_users', isAdmin, function(req, res) {
    
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

router.get('/new_employee/:id', isAdmin, function(req, res) {
  res.render('users/new_employee', {
     id: req.params.id
  })
});

router.post('/new_employee/:id', isAdmin, function(req, res) {
  var {ime, prezime, email, password,role} = req.body
  password = cryptor.encrypt(password);
  db.query('insert into Users(name,last_name,email,password) values($1,$2,$3,$4) returning *', [ime,prezime,email,password])
    .then(resp => {
      var {id} = resp.rows[0]
      return db.query('insert into lk_employment values($1,$2,$3)', [id,req.params.id,role])
    })
    .then(resp => {
      res.redirect('/restaurants/' + req.params.id)
    })
    .catch(err => {
      console.log(err);
    }) 
})

router.get('/all_orders/:id', function(req,res) {
  let {id} = req.params;
  Promise.all([db.query('select * from orders where id_restaurant = $1 and deliverer_id is null', [id]),
  db.query(`select id, name, last_name from (select * from lk_employment where 
    id_role = 4 and id_restaurant = $1) as pom left join 
    users on pom.id_user = users.id`, [id])]).then((values) => {
      console.log(values[0].rows);
      res.render('orders/all_orders', {
        orders: values[0].rows,
        deliverers: values[1].rows
      })
  });
})


module.exports = router;
