/* SQL */
const mysql = require('mysql');
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({path: path.join(__dirname, '..', '.env')});

const con = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

con.connect((err) => {
    if (err) {
        console.log('Error connecting to database');
        return;
    }
    console.log('Connection established');
});

const addClicks = function (clicks) {
    con.query('UPDATE abacus SET click = click + ? LIMIT 1', clicks, (err, _) => {
        if (err) throw err;
    });
};

const setClicks = function (clicks) {
    con.query('UPDATE abacus SET click = ? LIMIT 1', clicks, (err, _) => {
        if (err) throw err;
    });
};

exports.addClicks = addClicks;
exports.setClicks = setClicks;
exports.con = con;