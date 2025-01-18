const { Pool } = require("pg");
const dotenv = require("dotenv");

dotenv.config();

const pool = new Pool({
    user: process.env.DB.USER,
    host: process.env.DB.HOST,
    database: process.env.DB_NAME,
    password: process.env.DB.PASSWORD,
    port: process.env.DB.PORT,
})

pool.on("connect", ()=> {
    console.log("Connected to the database");
})

module.exports = pool;