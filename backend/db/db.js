// const { Pool } = require("pg");
// const dotenv = require("dotenv");

// require("dotenv").config({ path: "./conf/.env" });

// const pool = new Pool({
//     user: process.env.DB.USER,
//     host: process.env.DB.HOST,
//     database: process.env.DB_NAME,
//     password: process.env.DB.PASSWORD,
//     port: process.env.DB.PORT,
// })

// pool.on("connect", ()=> {
//     console.log("Connected to the database");
// })

// module.exports = pool;




// const { Pool } = require("pg");
// const dotenv = require("dotenv");

// // Load environment variables
// dotenv.config();

// // Create a connection pool
// const pool = new Pool({
//   user: process.env.DB_USER,
//   host: process.env.DB_HOST,
//   database: process.env.DB_NAME,
//   password: process.env.DB_PASSWORD,
//   port: process.env.DB_PORT,
// });

// pool.on("connect", () => {
//   console.log("Connected to the database");
// });

// // Export the pool for queries
// module.exports = pool;


const { Pool } = require("pg");
const dotenv = require("dotenv");

// Load environment variables
require("dotenv").config({ path: "./conf/.env" });

// Validate environment variables
const requiredEnvVars = ['DB_USER', 'DB_HOST', 'DB_NAME', 'DB_PASSWORD', 'DB_PORT'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}

// Create a connection pool
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT),
  // Add some connection pool settings
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 2000, // How long to wait when connecting a new client
});

pool.on("connect", () => {
  console.log("Connected to the database");
});

pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
});

// Add a simple test query function
const testConnection = async () => {
  try {
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    console.log('Database connection test successful');
  } catch (err) {
    console.error('Database connection test failed:', err);
    throw err;
  }
};

// Test the connection immediately
testConnection().catch(console.error);

module.exports = pool;