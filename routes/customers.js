const { response } = require('express');
var express = require('express');
const db = require('../config/db');
var router = express.Router();
const pg = require('../config/db');
const cryptor = require('../config/cryptor');

router.get('/new_customer', function(req,res) {
    res.render('customers/new_customer', {
    });
});
  
router.post('/new_customer', function(req,res) {
    let {ime,prezime,email,password,adresa} = req.body;
    password = cryptor.encrypt(password);
    db.query('insert into customers(name,last_name,email,password,address) values($1,$2,$3,$4,$5) returning *', [ime,prezime,email,password,adresa])
        .then(response => {
            console.log('Insertovano');
            res.redirect('/customers/' + response.rows[0].id);
        })
        .catch(err => {
            console.log(err);
        })
});

router.get('/login', function(req, res, next) {
    res.render('customers/login')
  });

  router.post('/login', function(req, response) {
    let {email, password} = req.body
    console.log(req.body);
    db.query('select id, email, password from Customers where email = $1', [email])
      .then(res => {
          if(password == cryptor.decrypt(res.rows[0].password)) {
            response.cookie("id", cryptor.encrypt(res.rows[0].id))
            response.redirect('/customers/' + res.rows[0].id);
          }
        
      })
      .catch(err => {
        console.log(err);
      })
  })

  router.get('/logout', function(req,res) {
    res
      .clearCookie("id")
      .redirect('/customers/login')
  })
  
router.get('/:id', function(req,res) {
    let {id} = req.params;
    db.query('select * from customers where id=$1', [id])
    .then(response => {
        const result = response.rows[0];
        res.render('customers/customer_account', {
            customer: result,
        });
    })
    .catch(err => {
        console.log(err);
    })
})
router.get('/:id/customer_orders', function(req,res) {
    let {id} = req.params;
    db.query('select price,status,date_created,payment_type,delivery_time from orders where customer_id = $1', [id])
        .then(response => {
            const result = response.rows;
            res.render('customers/customer_orders', {
                order: result,
                id: id
            })
        })
        .catch(err => {
            console.log(err);
        })
})


module.exports = router;