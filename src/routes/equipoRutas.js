 const router = require("express").Router();
const conexion = require("../db/conexion");
const obtenerDatosEquipo = require('../models/equipo');
const authMiddleware = require("../middleware/auth");

router.get('/equipo', authMiddleware.isAuthenticated, (req, res) => {
    const sql = "SELECT * FROM equipo";

    conexion.query(sql, (err, data) => {
        if(err){
            throw err;
        } else{
            res.render("equipo_views/mostrar", {equipoData:data});
        }
    });
});

router.get('/detallesEquipo/:id', (req, res) => {
    const id = req.params.id;

    const sqlEquipo = `
        SELECT tipo_equipo, marca, modelo, no_serie, sistema_operativo, propietario, 
               linea_telefonica, pin, imei, cuenta_google, password_cuenta, 
               DATE_FORMAT(fecha_compra, '%d-%m-%Y') AS fecha_compra, 
               DATE_FORMAT(fecha_renovacion, '%d-%m-%Y') AS fecha_renovacion, 
               estado_equipo
        FROM equipo 
        WHERE id_equipo = ?
    `;
    
    const sqlLicencias = `
        SELECT nombre, tipo_licencia, keycode, 
               DATE_FORMAT(fecha_compra, '%d-%m-%Y') AS fecha_compra, 
               DATE_FORMAT(fecha_renovacion, '%d-%m-%Y') AS fecha_renovacion, 
               proveedor
        FROM licencia
        WHERE id_equipo2 = ?
    `;

    conexion.query(sqlEquipo, [id], (errorEquipo, equipoResults) => {
        if (errorEquipo) throw errorEquipo;

        conexion.query(sqlLicencias, [id], (errorLicencias, licenciasResults) => {
            if (errorLicencias) throw errorLicencias;

            res.render('equipo_views/detalles', { 
                data: equipoResults[0], 
                licencias: licenciasResults 
            });
        });
    });
});

router.get('/nuevoEquipo', authMiddleware.isAuthenticated, (req, res) => {
    res.render("equipo_views/nuevo");
});

router.post('/insertarDatosEquipo', authMiddleware.isAuthenticated, (req, res) => {
    const tipo_equipo = req.body.tipo_equipo;
    const marca = req.body.marca;
    const no_serie = req.body.no_serie;
    const modelo = req.body.modelo;
    const sistema_operativo = req.body.sistema_operativo;
    const propietario = req.body.propietario;
    const linea_telefonica = req.body.linea_telefonica;
    const pin = req.body.pin;
    const imei = req.body.imei;
    const cuenta_google = req.body.cuenta_google;
    const password_cuenta = req.body.password_cuenta;
    const fecha_compra = req.body.fecha_compra;
    const fecha_renovacion = req.body.fecha_renovacion;
    const estado_equipo = req.body.estado_equipo;

    var registrarEquipo = "INSERT INTO equipo (tipo_equipo, marca, modelo, no_serie, sistema_operativo, propietario, linea_telefonica, pin, imei, cuenta_google, password_cuenta, fecha_compra, fecha_renovacion, estado_equipo) VALUES ('"+tipo_equipo+"','"+marca+"','"+modelo+"','"+no_serie+"','"+sistema_operativo+"','"+propietario+"','"+linea_telefonica+"','"+pin+"','"+imei+"','"+cuenta_google+"','"+password_cuenta+"','"+fecha_compra+"','"+fecha_renovacion+"','"+estado_equipo+"')"

    conexion.query(registrarEquipo, (err) => {
        if(err){
            throw err;
        } else{
            console.log("Equipo guardado correctamente");
            res.redirect('/equipo');
        }
    });
});

router.get('/editarEquipo/:id', authMiddleware.isAuthenticated, (req, res) => {
    const id = req.params.id;

    const sql = `
    SELECT id_equipo, tipo_equipo, marca, modelo, no_serie, sistema_operativo, propietario, linea_telefonica,
        pin, imei, cuenta_google, password_cuenta, DATE_FORMAT(fecha_compra, '%d-%m-%Y') AS fecha_compra,
        DATE_FORMAT(fecha_renovacion, '%d-%m-%Y') AS fecha_renovacion, estado_equipo
    FROM equipo
    WHERE id_equipo = ?
    `;

    conexion.query(sql, [id], (error, results) => {
        if(error){
            throw err;
        } else{
            res.render('equipo_views/editar', {data: results[0]});
        }
    });
});

router.post('/actualizarEquipo', authMiddleware.isAuthenticated, (req, res) => {
    const id_equipo = req.body.id_equipo;
    const tipo_equipo = req.body.tipo_equipo;
    const marca = req.body.marca;
    const modelo = req.body.modelo;
    const no_serie = req.body.no_serie;
    const sistema_operativo = req.body.sistema_operativo;
    const propietario = req.body.propietario;
    const linea_telefonica = req.body.linea_telefonica;
    const pin = req.body.pin;
    const imei = req.body.imei;
    const cuenta_google = req.body.cuenta_google;
    const password_cuenta = req.body.password_cuenta;
    const fecha_compra = req.body.fecha_compra;
    const fecha_renovacion = req.body.fecha_renovacion;
    const estado_equipo = req.body.estado_equipo;

    const query = `
        UPDATE equipo
        SET tipo_equipo = ?, marca = ?, modelo = ?, no_serie = ?, sistema_operativo = ?, propietario = ?,
            linea_telefonica = ?, pin = ?, imei = ?, cuenta_google = ?, password_cuenta = ?, 
            fecha_compra = ?, fecha_renovacion = ?, estado_equipo = ?
        WHERE id_equipo = ?
    `;

    const values = [tipo_equipo, marca, modelo, no_serie, sistema_operativo, propietario, linea_telefonica,
        pin, imei, cuenta_google, password_cuenta, fecha_compra, fecha_renovacion, estado_equipo, id_equipo];

    conexion.query(query, values, (error, results) => {
        if(error){
            console.log(error);
        } else{
            console.log("Equipo actualizado correctamente");
            res.redirect("/equipo");
        }
    });
});

router.get('/eliminarEquipo/:id', authMiddleware.isAuthenticated, (req, res) => {
    const id_equipo = req.params.id;

    const eliminarEquipo = "DELETE FROM equipo WHERE id_equipo = ?";

    conexion.query(eliminarEquipo, id_equipo, (err) => {
        if(err){
            console.log(err);
            req.status(500).send("Error al eliminar el equipo")
        } else{
            console.log("Equipo eliminardo correctamente");
            res.redirect('/equipo');
        }
    });
}); 

module.exports = router;

//  