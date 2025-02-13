const { decrypt } = require("../utils/passwordutils");

module.exports = {
    authmiddleware: (req,res,next) => {
        let cookie = req.cookies.id;
        if(cookie != null){
            let id = decrypt(cookie)
            console.log(id)
            next();
        }
        else {
            res.redirect('/users/login');
        }

    }
}