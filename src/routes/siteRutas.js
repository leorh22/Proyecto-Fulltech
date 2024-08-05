const router = require("express").Router(); // Crea una instancia del enrutador de Express.
const conexion = require("../db/conexion");
const obtenerDatosSite = require("../models/site");
const authMiddleware = require("../middleware/auth");

// Ruta para mostrar todos los sites
router.get('/site', authMiddleware.isAuthenticated, (req, res) => {
    const sql = "SELECT * FROM site";

    conexion.query(sql, (err, data) => {
        if (err) {
            throw err;
        } else {
            res.render("site_views/mostrar", { title: "SITE", siteData: data });
        }
    });
});

// Ruta para ver detalles de un site
router.get('/detallesSite/:id', authMiddleware.isAuthenticated, (req, res) => {
    const id = req.params.id;

    conexion.query('SELECT * FROM site WHERE id_dispositivo = ?', [id], (error, results) => {
        if (error) {
            throw error;
        } else {
            res.render('site_views/detalles', { data: results[0] });
        }
    });
});

// Ruta para el formulario de nuevo site
router.get('/nuevoSite', authMiddleware.isAuthenticated, (req, res) => {
    res.render('site_views/nuevo');
});

// Ruta para insertar datos de un nuevo site
router.post('/insertarDatosSite', authMiddleware.isAuthenticated, (req, res) => {
    const { dispositivo, tipo_dispositivo, marca, modelo, numero_serie, comentario, estado_dispositivo } = obtenerDatosSite(req, res);

    var registrarSite = "INSERT INTO site (dispositivo, tipo_dispositivo, marca, modelo, no_serie, comentario, estado_dispositivo) VALUES ('" + dispositivo + "','" + tipo_dispositivo + "','" + marca + "','" + modelo + "','" + numero_serie + "','" + comentario + "','" + estado_dispositivo + "')";

    conexion.query(registrarSite, (err) => {
        if (err) {
            throw err;
        } else {
            console.log("Datos almacenados correctamente");
            res.redirect('/site');
        }
    });
});

// Ruta para el formulario de editar site
router.get('/editarSite/:id', authMiddleware.isAuthenticated, (req, res) => {
    const id = req.params.id;
    conexion.query('SELECT * FROM site WHERE id_dispositivo = ?', [id], (error, results) => {
        if (error) {
            throw error;
        } else {
            res.render('site_views/editar', { data: results[0] });
        }
    });
});

// Ruta para actualizar datos de un site
router.post('/actualizarSite', authMiddleware.isAuthenticated, (req, res) => {
    const id_dispositivo = req.body.id;
    const dispositivo = req.body.disp;
    const tipo_dispositivo = req.body.tipo_disp;
    const marca = req.body.marca_disp;
    const modelo = req.body.modelo_disp;
    const no_serie = req.body.num_serie;
    const estado_dispositivo = req.body.estado_disp;
    const comentario = req.body.comentario_disp;

    conexion.query('UPDATE site SET ? WHERE id_dispositivo = ?', [{ dispositivo: dispositivo, tipo_dispositivo: tipo_dispositivo, marca: marca, modelo: modelo, no_serie: no_serie, estado_dispositivo: estado_dispositivo, comentario: comentario }, id_dispositivo], (error, results) => {
        if (error) {
            console.log(error);
        } else {
            console.log('Site actualizado correctamente');
            res.redirect('/site');
        }
    });
});

// Ruta para eliminar un site
router.get('/eliminarSite/:id', authMiddleware.isAuthenticated, (req, res) => {
    const id_dispositivo = req.params.id;

    const eliminarSite = "DELETE FROM site WHERE id_dispositivo = ?"

    conexion.query(eliminarSite, id_dispositivo, (err) => {
        if (err) {
            console.error(err);
            res.status(500).send("Error al eliminar el dispositivo");
        } else {
            console.log("Dispositivo eliminado correctamente");
            res.redirect('/site');
        }
    });
});

module.exports = router;
