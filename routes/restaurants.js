const { response } = require('express');
var express = require('express');
const db = require('../config/db');
const authUtils = require('../utils/checkIfAdmin');
const cryptor = require('../config/cryptor');
var router = express.Router();
const {isAdmin} = require('../utils/isAdmin');

router.get('/add_restaurant', function(req, res) {
    res.render('restaurants/add_restaurant')
  });
  
router.post('/add_restaurant', isAdmin, function(req, res) {
    let {naziv, adresa, latituda, longituda, telefon, grad} = req.body
    db.query('insert into Restaurants (name, address, latitude, longitude, phone, city) values($1,$2,$3,$4,$5,$6)', [naziv,adresa,latituda,longituda,telefon,grad])
      .then(() => {
        res.redirect('/restaurants/add_restaurant');
      })
      .catch(err => {
        console.log(err);
        res.redirect('/restaurants/add_restaurant');
      })
});
  
router.get('/all_restaurants', authUtils.checkIfAdmin, function(req, res) {
      let query = `select * from lk_employment
      left join restaurants
      on lk_employment.id_restaurant = restaurants.id
      where id_user = $1 and archive=false;`
    
    db.query(query, [cryptor.decrypt(req.cookies.id)])
     .then(response => {
         const result = response.rows;
         res.render('restaurants/all_restaurants', {
             restaurants: result
         })
     })
     .catch(err => {
         console.log(err);
     })
})
   
router.get('/find_restaurant', function(req, res) {
    res.render('restaurants/find_restaurant')
  });
  
router.post('/find_restaurant', function(req, res) {
    let {naziv} = req.body
    db.query('select name, address, latitude, longitude, phone, city from restaurants where name=$1', [naziv])
      .then(response => {
        const result = response.rows[0];
        res.render('restaurants/restaurant_details', {
            restaurant: result
        })
      })
      .catch(err => {
        console.log(err);
      })
  })

  router.get('/update_restaurant/:id', function(req, res) {
    var id = req.params.id;
    res.render('restaurants/update_restaurant', {
      id:id

    })
  });
   
  router.post('/update_restaurant/:id', isAdmin, function(req, res) {
    let {naziv, adresa, range} = req.body;
    var id = req.params.id;
    console.log(id);
    db.query("update restaurants set name=$1, address=$2, range=$3 where id=$4 ", [naziv,adresa,range,id])
     .then(() => {
         res.redirect('/restaurants/all_restaurants')
     })
     .catch(err => {
         console.log(err);
     })
});
  
router.get('/:id', function(req, res) {
  let id = req.params.id;
  db.query('select name, last_name from users where id in (select id_user from lk_employment where id_restaurant = $1)', [id])
     .then(response => {
         const result = response.rows;
         res.render('users/restaurant_employers', {
             employers: result,
             id: id
         })
     })
     .catch(err => {
         console.log(err);
     })
});

router.put('/archive/:id', isAdmin, function(req,res) {
  let id = req.params.id
  db.query('update restaurants set archive = true where id = $1', [id])
    .then(response => {
      res.sendStatus(204);
    })
    .catch(err => {
      console.log(err);
      res.sendStatus(400);
    })
})
module.exports = router;