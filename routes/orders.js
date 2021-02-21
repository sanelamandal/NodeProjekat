var express = require('express');
const db = require('../config/db');
var router = express.Router();
const cryptor = require('../config/cryptor');
const Notification = require('node-notifier');
const {isAdmin} = require('../utils/isAdmin');

router.get('/select_restaurant', function(req,res){
    db.query('select * from restaurants')
        .then(response => {
            res.render('orders/select_restaurant', {
                restaurants: response.rows
            })
        })
        .catch(err => {
            console.log(err);
        })
});

router.get('/:id', function(req,res) {
    let {id} = req.params;
    db.query('select * from products where id_restaurant = $1', [id])
        .then(response => {
            res.render('orders/restaurant_products', {
                products: response.rows,
                id: id
            })
        })
});

router.post('/:id/submit_order', async function(req,res) {
    let full_price = 0;
    let products = [];
    console.log(req.body);
    let id_c = cryptor.decrypt(req.cookies.id);
    console.log(id_c);
    Object.keys(req.body.body).map(e => {
        full_price += req.body.body[e].unit_price;
        products.push(req.body.body[e].name);
    })
    console.log(full_price);
    db.query('insert into orders(price,status,payment_type,delivery_time,customer_id) values($1,$2,$3,$4,$5) returning *', [full_price,'pending',req.body.payment_type,req.body.delivery_time=="" ? null: req.body.delivery_time,id_c])
        .then(response => {
            console.log('insertovano');
            products.forEach(async e => {
                await db.query('insert into lk_product_order(id_order,product_name) values($1,$2)', [response.rows[0].id,e])
            })
            
            res.sendStatus(200);
            Notification.notify({
                title: 'New Order',
                message: 'You have a new order.'
            })
            
        })
        .catch(err => {
            console.log(err);
            res.sendStatus(400);
        })
});
    
router.post('/update/:id', isAdmin, function(req,res) {
    let {id} = req.params;
    let {deliverer_id} = req.body;
    console.log(id,deliverer_id);
    db.query('update orders set deliverer_id=$1 where id = $2', [deliverer_id,id])
        .then(response => {
            res.sendStatus(201);
        })
});

router.get('/orders_day/:id', function(req,res){
    let {id} = req.params;
    db.query(`select * from orders
    where deliverer_id = $1 and date_created = CURRENT_DATE and status = 'pending';`, [id])
    .then(response => {
        res.render('deliverer_orders', {
            orders: response.rows
        })
    })
})

router.post('/update_status', function(req,res) {
    let {id} = req.params;
    let {deliverer_id} = req.body;
    console.log(id,deliverer_id);
    db.query('update orders set status="delivered" where id = $2', [deliverer_id,id])
        .then(response => {
            res.sendStatus(201);
            Notification.notify({
                title: 'Status',
                message: 'Delivered.'
            })
        })
})
module.exports = router;