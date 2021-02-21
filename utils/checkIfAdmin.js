const db = require('../config/db');
const { decrypt } = require("./passwordutils");

module.exports = {
    checkIfAdmin: (req,res,next) => {
        let id = req.cookies.id;
        id = decrypt(id);
        if(id == 13) {
            db.query('select * from restaurants where archive=false')
                 .then(response => {
                    const result = response.rows;
                    res.render('restaurants/all_restaurants', {
                        restaurants: result
                    })
                 })
                .catch(err => {
                    console.log(err);
                })
        }
        next();
    }
}