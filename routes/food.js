const { response } = require('express');
var express = require('express');
const db = require('../config/db');
var router = express.Router();

router.get('/restaurant_food', function(req, res){
    res.render('food/restaurant_food') 
});

router.post('/restaurant_food', function(req, res) {
    let {naziv} = req.body;
    db.query('select type from food_types where id in (select id_food from lk_restaurant_food where id_restaurant in  (select id from restaurants where name = $1))', [naziv])
     .then(response => {
         const result = response.rows;
         res.render('food/all_food', {
             food: result
         })
     })
     .catch(err => {
         console.log(err);
     })
})


module.exports = router;