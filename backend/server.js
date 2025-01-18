const express = require("express");
const dotnev = require("dotenv");
const cors = require("cors");

dotnev.config();

const app = express();
app.use(cors());
const PORT = 5000;

app.use(express.json());

app.listen(PORT, ()=>{
    console.log(`Server running on http://localhost:${PORT}`)
})