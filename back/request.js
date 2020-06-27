/* SQL */
var mysql = require('mysql');
var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "starfox"
});

con.connect((err) => {
    if (err) {
        console.log('Error connecting to database');
        return;
    }
    console.log('Connection established');
});

const addClicks = function (clicks) {
    con.query('UPDATE abacus SET click = click + ? WHERE id = 0', clicks, (err, rows) => {
        if (err) throw err;
    });
};

exports.addClicks = addClicks;
exports.con = con;