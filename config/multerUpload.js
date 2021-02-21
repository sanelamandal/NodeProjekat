var multer  = require('multer');

const storage = multer.diskStorage({
    filename: (req,file,cb) => {
        cb(null,file.fieldname + '_' + Date.now() + '.' + file.mimetype.split('/')[1]);
    },
    destination: (req,file,cb) => {
        cb(null,'public/images')
    }
 })

 module.exports = storage;