const db = require('../config/db');
const { decrypt } = require("./passwordutils");

module.exports = {
    isAdmin: (req,res,next) => {
        let id = req.cookies.id;
        id = decrypt(id);
        if(id == 13) {
            next();

        }
        else {
            res.send('Niste admin!');
        }
    }
}