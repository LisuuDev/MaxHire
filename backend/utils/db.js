 const {createPool} = require("mysql2/promise");



const pool = createPool({
    host: process.env.DB_HOST || "127.0.0.1",
    user: "root",
    database: "storemax",
    namedPlaceholders: true,
    decimalNumbers: true,
});


module.exports = {
    pool,
}
