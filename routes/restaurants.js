const { response } = require('express');
var express = require('express');
const db = require('../config/db');
var router = express.Router();
//const pg = require('../config/db');

router.get('/add_restaurant', function(req, res) {
    res.render('restaurants/add_restaurant')
  });
  
router.post('/add_restaurant', function(req, res) {
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
  
router.get('/all_restaurants', function(req, res) {
    
    db.query('select * from restaurants')
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
   
  router.post('/update_restaurant/:id', function(req, res) {
    let {naziv, adresa} = req.body;
    var id = req.params.id;
    console.log(id);
    db.query("update restaurants set name=$1, address=$2 where id=$3 ", [naziv,adresa,id])
     .then(() => {
         res.redirect('/restaurants/all_restaurants')
     })
     .catch(err => {
         console.log(err);
     })
});
   
module.exports = router;