var mysql = require('mysql');

var conexion = mysql.createConnection({
    host: "localhost",
    database: "prueba1",
    user: "root",
    password: ""
});

conexion.connect((err) => {
    if(err){
        throw err;
    } else{
        console.log("Database is connected!");
    }
});

module.exports = conexion;