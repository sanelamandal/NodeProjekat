const {Pool} = require('pg');
const db = new Pool({
    host:'hattie.db.elephantsql.com',
    password:'3VxgmRsiTt1qEZkMYFT0yExWrzDJ_sig',
    user: 'hiogtygx',
    port: 5432,
    database:'hiogtygx'
})

module.exports = pg