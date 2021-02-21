const { response } = require('express');
var express = require('express');
const db = require('../config/db');
var router = express.Router();
var multer  = require('multer');
const storage = require('../config/multerUpload');
const { promiseImpl } = require('ejs');
var upload = multer({storage});

router.get('/', function(req, res){
    res.render('food/restaurant_food') 
});

router.get('/special_prices', function(req,res) {
    db.query(`select special.name, special.photo, special.price, restaurants.name as r from (select products.id_restaurant, products.name, products.photo, special_prices.price from products
        inner join special_prices on
        products.special_price = special_prices.id
        where special_prices.active = true)
        as special inner join restaurants
        on special.id_restaurant = restaurants.id;`)
    .then(response => {
        res.render('food/special_prices', {
            special: response.rows
        })
    })
});

router.get('/most_popular', function(req,res) {
    db.query(`select products.name, products.photo, products.unit_price, restaurants.name as r
    from products inner join restaurants
    on products.id_restaurant = restaurants.id
    order by counter limit 5;`)
    .then(response => {
        res.render('food/most_popular', {
            popular: response.rows
        })
    })
});

router.get('/:id', function(req, res) {
    let {id} = req.params;
    db.query('select * from products where id_restaurant = $1', [id])
     .then(response => {
         const result = response.rows;
         res.render('food/all_food', {
             food: result,
             id: id
         })
     })
     .catch(err => {
         console.log(err);
     })
})

router.get('/:id/add_food', async function(req,res) {
    let {id} = req.params;
    console.log(id);
    try {
        let result = await db.query('select * from food_types');
        res.render('food/add_food', {
            id: id,
            food_types: result.rows
        })
    } catch (error) {
        console.log(error);
    }
    
})

router.post('/:id/add_food', upload.single('picture'), function(req,res) {
    let {id} = req.params;
    let {naziv,cijena,food_type} = req.body;
    console.log(req.body);
    console.log(req.file.filename);
    db.query('insert into products (name,unit_price,id_food,photo,id_restaurant) values($1,$2,$3,$4,$5)', [naziv,cijena,food_type,req.file.filename,id])
        .then(response => {
            res.send('Inserted!');
        })
        .catch(err => {
            console.log(err);
        })
})



router.get('/:id/add_menu', async function(req,res) {
    let {id} = req.params;
    console.log(id);
    db.query('select * from menu where id_restaurant = $1', [id])
        .then(response => {
            res.render('menu/add_menu', {
                id: id,
                menus: response.rows
            })
    })
})

router.post('/:id/add_menu', function(req,res) {
    let {id} = req.params;
    let {naziv} = req.body;
    db.query('insert into menu(name,id_restaurant) values($1,$2)', [naziv,id])
        .then(response => {
            res.redirect('/food/restaurant_food/' + id + '/add_menu');
        })
        .catch(err => {
            console.log(err);
        })
})

router.get('/:id/menu_add_food/:menu_id', function(req,res) {
    let {id, menu_id} = req.params;
    Promise.all([
        db.query('select * from products where id_restaurant = $1', [id]),
        db.query(`
            select menu.name, products.name, products.unit_price from menu
            left join products_menu on
            menu.id = products_menu.id_menu
            left join products on
            products.id = products_menu.id_product
            where menu.id_restaurant = $1 and menu.id = $2;        
        `, [id,menu_id])
    ])
        .then(response => {
            console.log(response[0].rows);
            res.render('menu/menu_add_food', {
                id: id,
                products: response[0].rows,
                menu_products: response[1].rows,
                menu_id: menu_id
        })
    })
})

router.post('/:id/menu_add_food/:menu_id', function(req,res) {
    let {food_name} = req.body;
    let {id,menu_id} = req.params;
    db.query('insert into products_menu(id_product,id_menu) values($1,$2)', [food_name,menu_id])
        .then(response => {
            res.redirect('/food/restaurant_food/' + id + '/menu_add_food/' + menu_id);
        })
        .catch(err => {
            console.log(err);
        })
})



module.exports = router;