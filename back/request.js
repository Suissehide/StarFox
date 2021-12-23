/* SQL */
var mysql = require('mysql');
const dotenv = require("dotenv");

dotenv.config({ path: __dirname + '/.env.local' });

var con = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
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
    con.query('UPDATE abacus SET click = click + ? LIMIT 1', clicks, (err, rows) => {
        if (err) throw err;
    });
};

exports.addClicks = addClicks;
exports.con = con;