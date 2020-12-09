const crypter = require('../config/cryptor');
module.exports = {
    encrypt: (pass) => {
        return crypter.encrypt(pass);
    },
    decrypt: (pass) => {
        return crypter.decrypt(pass);
    }
}