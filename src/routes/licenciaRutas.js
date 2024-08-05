const router = require("express").Router();
const conexion = require("../db/conexion"); 
const authMiddleware = require('../middleware/auth');

router.get("/licencia", authMiddleware.isAuthenticated, (req, res) => {
    const sql = `
        SELECT l.id_licencia, l.nombre, l.tipo_licencia, l.keycode, DATE_FORMAT(l.fecha_compra, '%d-%m-%Y') AS fecha_compra,DATE_FORMAT(l.fecha_renovacion, '%d-%m-%Y') AS fecha_renovacion, l.proveedor, l.comentario, l.id_equipo2, e.no_serie
        FROM licencia AS l 
        INNER JOIN equipo AS e ON e.id_equipo = l.id_equipo2
    `;

    conexion.query(sql, (err, data) => {
        if(err){
            throw err;
        } else{
            res.render("licencia_views/mostrar", {licenciaData:data, title:"Licencias"});
        }
    });
});

router.get("/detallesLicencia/:id", (req, res) => {
    const id = req.params.id;
    const sql = `
        SELECT l.nombre, l.tipo_licencia, l.keycode, DATE_FORMAT(l.fecha_compra, '%d-%m-%Y') AS fecha_compra, e.no_serie,
            DATE_FORMAT(l.fecha_renovacion, '%d-%m-%Y') AS fecha_renovacion, DATEDIFF(l.fecha_renovacion, now()) AS tiempo_restante, l.proveedor, l.comentario, l.id_equipo2
        FROM licencia AS l
        INNER JOIN equipo AS e ON e.id_equipo = l.id_equipo2
        WHERE l.id_licencia = ?
    `;
    conexion.query(sql, [id], (error, results) => {
        if (error) {
            console.error(error);
            res.status(500).send("Error al obtener los detalles de la licencia");
        } else {
            if (results.length > 0) {
                res.render('licencia_views/detalles', { data: results[0] });
            } else {
                res.status(404).send("Licencia no encontrada");
            }
        }
    });
});

router.get('/nuevaLicencia', (req, res) => {
    res.render("licencia_views/nuevo");
});

router.post('/insertarDatosLicencia', (req, res) => {
    const nombre = req.body.nombre;
    const tipo_licencia = req.body.tipo_licencia;
    const keycode = req.body.keycode;
    const fecha_compra = req.body.fecha_compra;
    const fecha_renovacion = req.body.fecha_renovacion;
    const proveedor = req.body.proveedor;
    const comentario = req.body.comentario;
    const id_equipo2 = req.body.id_equipo2;

    var registrarLicencia = "INSERT INTO licencia (nombre, tipo_licencia, keycode, fecha_compra, fecha_renovacion, proveedor, comentario, id_equipo2) VALUES ('"+ nombre +"','"+ tipo_licencia +"','"+ keycode +"','"+ fecha_compra +"','"+ fecha_renovacion +"','"+ proveedor +"','"+ comentario +"','"+ id_equipo2 +"')";

    conexion.query(registrarLicencia, (err) => {
        if(err){
            throw err;
        } else{
            console.log("Licencia agregada correctamente");
            res.redirect('/licencia')
        }
    });
});

router.get('/editarLicencia/:id', (req, res) => {
    const id = req.params.id;

    const sql = `
        SELECT id_licencia, nombre, tipo_licencia, keycode,
            DATE_FORMAT(fecha_compra, '%d-%m-%Y') AS fecha_compra,
            DATE_FORMAT(fecha_renovacion, '%d-%m-%Y') AS fecha_renovacion,
            proveedor, comentario, id_equipo2
        FROM licencia
        WHERE id_licencia = ?
    `;

    conexion.query(sql, [id], (error, results) => {
        if(error){
            throw error;
        } else{
            res.render('licencia_views/editar', {data: results[0]});
        }
    });
});

router.post('/actualizarLicencia', (req, res) => {
    const id_licencia = req.body.id_licencia;
    const nombre = req.body.nombre;
    const tipo_licencia = req.body.tipo_licencia;
    const keycode = req.body.keycode;
    const fecha_compra = req.body.fecha_compra;
    const fecha_renovacion = req.body.fecha_renovacion;
    const proveedor = req.body.proveedor;
    const comentario = req.body.comentario;
    const id_equipo2 = req.body.id_equipo2;

    const query = `
        UPDATE licencia 
        SET nombre = ?, tipo_licencia = ?, keycode = ?, fecha_compra = ?, fecha_renovacion = ?, proveedor = ?, comentario = ?, id_equipo2 = ?
        WHERE id_licencia = ?
    `;

    const values = [nombre, tipo_licencia, keycode, fecha_compra, fecha_renovacion, proveedor, comentario, id_equipo2, id_licencia];

    conexion.query(query, values, (error, results) => {
        if (error) {
            console.log(error);
        } else {
            console.log("Licencia actualizada correctamente");
            res.redirect('/licencia');
        }
    });
});

router.get('/eliminarLicencia/:id', (req, res) => {
    const id_licencia = req.params.id;

    const eliminarLicencia = "DELETE FROM licencia WHERE id_licencia = ?";

    conexion.query(eliminarLicencia, id_licencia, (err) => {
        if(err){
            console.log(err);
            res.status(500).send("Error al eliminar la licencia");
        } else {
            console.log("Licencia eliminada correctamente");
            res.redirect('/licencia');
        }
    });
}); 

module.exports = router;
