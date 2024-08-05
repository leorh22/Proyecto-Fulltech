const router = require("express").Router(); // Crea una instancia del enrutador de Express.
const conexion = require("../db/conexion");
const ExcelJS = require('exceljs');
const authMiddleware = require('../middleware/auth');

router.get('/', authMiddleware.isAuthenticated, (req, res) => {
    const sql = "SELECT e.id_empleado, e.nombre_empleado, e.no_empleado, e.area, e.estado_empleado, eq.id_equipo, eq.tipo_equipo, eq.marca, eq.modelo, eq.no_serie, eq.sistema_operativo, eq.propietario, eq.linea_telefonica, eq.pin, eq.imei, eq.cuenta_google, eq.password_cuenta, eq.fecha_compra, eq.fecha_renovacion, eq.estado_equipo, r.id_registro, DATE_FORMAT(r.fecha_asignacion, '%d-%m-%Y') AS fecha_asignacion, r.comentario, r.id_empleado1, r.id_equipo1 FROM registro AS r INNER JOIN empleado AS e ON e.id_empleado = r.id_empleado1 INNER JOIN equipo AS eq ON eq.id_equipo = r.id_equipo1";

    conexion.query(sql, (err, data) => {
        if (err) {
            throw err;
        } else {
            res.render("inventario_general/mostrar", {title: "Inventario General", registroData: data});
        }
    });
});

router.get('/detallesRegistro/:id', authMiddleware.isAuthenticated, (req, res) => {
    const id = req.params.id;

    const sql = `
        SELECT e.id_empleado, e.nombre_empleado, e.no_empleado, e.area, e.estado_empleado,
               eq.id_equipo, eq.tipo_equipo, eq.marca, eq.modelo, eq.no_serie, eq.sistema_operativo, eq.propietario,
               eq.linea_telefonica, eq.pin, eq.imei, eq.cuenta_google, eq.password_cuenta, DATE_FORMAT(eq.fecha_compra, '%d-%m-%Y') AS fecha_compra,
               DATE_FORMAT(eq.fecha_renovacion, '%d-%m-%Y') AS fecha_renovacion, eq.estado_equipo, r.id_registro, DATE_FORMAT(r.fecha_asignacion,'%d-%m-%Y') AS fecha_asignacion,
               r.comentario, r.id_empleado1, r.id_equipo1
        FROM registro AS r
        INNER JOIN empleado AS e ON e.id_empleado = r.id_empleado1
        INNER JOIN equipo AS eq ON eq.id_equipo = r.id_equipo1
        WHERE r.id_registro = ?
    `;

    conexion.query(sql, [id], (error, results) => {
        if (error) {
            throw error; 1 
        } else {
            if (results.length > 0) {
                res.render('inventario_general/detalles', { data: results[0] });
            } else {
                res.status(404).send('Registro no encontrado');
            }
        }
    });
}); 

router.get('/inventarioNuevo', authMiddleware.isAuthenticated, (req, res) => {
    res.render("inventario_general/nuevo");
});

router.post('/insertarRegistro', (req, res) => {
    const { fecha_asignacion, comentario, id_empleado1, id_equipo1 } = req.body;

    const sql = 'INSERT INTO registro (fecha_asignacion, comentario, id_empleado1, id_equipo1) VALUES (?, ?, ?, ?)';
    conexion.query(sql, [fecha_asignacion, comentario, id_empleado1, id_equipo1], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error al agregar el registro');
        } else {
            console.log('Registro agregado correctamente');
            res.redirect('/'); // Redirigir a la página de inicio o a la página que desees
        }
    });
});

router.get('/editarRegistro/:id', authMiddleware.isAuthenticated, (req, res) => {
    const id = req.params.id;

    const sql = `
        SELECT id_registro, DATE_FORMAT(fecha_asignacion, '%Y-%m-%d') as fecha_asignacion, comentario, id_empleado1, id_equipo1
        FROM registro
        WHERE id_registro = ?
    `;

    conexion.query(sql, [id], (error, results) => {
        if (error) {
            throw error;
        } else {
            res.render('inventario_general/editar', {data: results[0]});
        }
    });
});

router.post('/actualizarRegistro', authMiddleware.isAuthenticated, (req, res) => {
    const id_registro = req.body.id_registro;
    const fecha_asignacion = req.body.fecha_asignacion;
    const comentario = req.body.comentario;
    const id_empleado1 = req.body.id_empleado1;
    const id_equipo1 = req.body.id_equipo1;

    const query = `
        UPDATE registro
        SET fecha_asignacion = ?, comentario = ?, id_empleado1 = ?, id_equipo1 = ?
        WHERE id_registro = ?
    `;

    const values = [fecha_asignacion, comentario, id_empleado1, id_equipo1, id_registro];

    conexion.query(query, values, (error, results) => {
        if (error) {
            console.log(error);
        } else {
            console.log("Registro actualizado correctamente");
            res.redirect('/');
        }
    });
});

router.get('/eliminarRegistro/:id', authMiddleware.isAuthenticated, (req, res) => {
    const id_registro = req.params.id;

    const eliminarRegistro = "DELETE FROM registro WHERE id_registro = ?";

    conexion.query(eliminarRegistro, id_registro, (err) => {
        if(err){
            console.log(err);
            res.status(500).send("Error al eliminar el registro");
        } else{
            console.log("Registro eliminado correctamente");
            res.redirect('/');
        }
    });
});

router.get('/exportarExcel', async (req, res) => {

    const sqlRegistro = `
        SELECT r.id_registro, DATE_FORMAT(r.fecha_asignacion, '%d-%m-%Y') AS fecha_asignacion, r.comentario, 
               e.nombre_empleado, e.no_empleado, e.area, 
               eq.tipo_equipo, eq.marca, eq.modelo, eq.no_serie,
               e.id_empleado, e.estado_empleado,
               eq.id_equipo, eq.sistema_operativo, eq.propietario, eq.linea_telefonica, eq.pin, eq.imei, eq.cuenta_google, eq.password_cuenta, eq.fecha_compra, eq.fecha_renovacion, eq.estado_equipo
        FROM registro AS r
        INNER JOIN empleado AS e ON e.id_empleado = r.id_empleado1
        INNER JOIN equipo AS eq ON eq.id_equipo = r.id_equipo1
    `;
    const sqlEquipo = `
        SELECT id_equipo, tipo_equipo, marca, modelo, no_serie, 
               sistema_operativo, propietario, linea_telefonica, pin, 
               imei, cuenta_google, password_cuenta, fecha_compra, 
               fecha_renovacion, estado_equipo 
        FROM equipo`;

    const sqlEmpleado = `
        SELECT id_empleado, nombre_empleado, no_empleado, area, estado_empleado 
        FROM empleado`;

    const sqlLicencias = `
        SELECT id_licencia, nombre, tipo_licencia, keycode, fecha_compra, 
               fecha_renovacion, proveedor, comentario, id_equipo2 
        FROM licencia`;

    const queryPromise = (sql) => {
        return new Promise((resolve, reject) => {
            conexion.query(sql, (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results);
                }
            });
        });
    };

    try {
        const [resultsRegistro, resultsEquipo, resultsEmpleado, resultsLicencias] = await Promise.all([
            queryPromise(sqlRegistro),
            queryPromise(sqlEquipo),
            queryPromise(sqlEmpleado),
            queryPromise(sqlLicencias)
        ]);

        const workbook = new ExcelJS.Workbook();

        const addSheetWithData = (workbook, sheetName, data, columns) => {
            const worksheet = workbook.addWorksheet(sheetName);
            worksheet.columns = columns;
            worksheet.getRow(1).eachCell((cell) => {
                cell.font = { bold: true };
                cell.alignment = { vertical: 'middle', horizontal: 'center' };
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'bcbcbc' }, // Color de fondo amarillo
                };
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' },
                };
            });
            
            data.forEach((row) => {
                const newRow = worksheet.addRow(row);
                newRow.eachCell((cell) => {
                    cell.border = {
                        top: { style: 'thin' },
                        left: { style: 'thin' },
                        bottom: { style: 'thin' },
                        right: { style: 'thin' },
                    };
                });
            });
        };

        addSheetWithData(workbook, 'Registros', resultsRegistro, [
            { header: 'ID Registro', key: 'id_registro', width: 15 },
            { header: 'Fecha Asignación', key: 'fecha_asignacion', width: 20 },
            { header: 'Comentario', key: 'comentario', width: 30 },
            { header: 'Nombre Empleado', key: 'nombre_empleado', width: 20 },
            { header: 'No. Empleado', key: 'no_empleado', width: 15 },
            { header: 'Área', key: 'area', width: 20 },
            { header: 'Tipo Equipo', key: 'tipo_equipo', width: 20 },
            { header: 'Marca', key: 'marca', width: 20 },
            { header: 'Modelo', key: 'modelo', width: 20 },
            { header: 'No. Serie', key: 'no_serie', width: 20 },
            { header: 'Sistema Operativo', key: 'sistema_operativo', width: 20 },   
            { header: 'Propietario', key: 'propietario', width: 20 },
            { header: 'Línea Telefónica', key: 'linea_telefonica', width: 20 },
            { header: 'PIN', key: 'pin', width: 20 },
            { header: 'IMEI', key: 'imei', width: 20 },
            { header: 'Cuenta Google', key: 'cuenta_google', width: 20 },
            { header: 'Contraseña', key: 'password_cuenta', width: 20 },
            { header: 'Fecha de Compra', key: 'fecha_compra', width: 20 },
            { header: 'Fecha de Renovación', key: 'fecha_renovacion', width: 20 }
        ]);

        addSheetWithData(workbook, 'Equipos', resultsEquipo, [
            { header: 'ID Equipo', key: 'id_equipo', width: 15 },
            { header: 'Tipo Equipo', key: 'tipo_equipo', width: 20 },
            { header: 'Marca', key: 'marca', width: 20 },
            { header: 'Modelo', key: 'modelo', width: 20 },
            { header: 'No. Serie', key: 'no_serie', width: 20 },
            { header: 'Sistema Operativo', key: 'sistema_operativo', width: 20 },
            { header: 'Propietario', key: 'propietario', width: 20 },
            { header: 'Línea Telefónica', key: 'linea_telefonica', width: 20 },
            { header: 'PIN', key: 'pin', width: 20 },
            { header: 'IMEI', key: 'imei', width: 20 },
            { header: 'Cuenta Google', key: 'cuenta_google', width: 20 },
            { header: 'Contraseña', key: 'password_cuenta', width: 20 },
            { header: 'Fecha de Compra', key: 'fecha_compra', width: 20 },
            { header: 'Fecha de Renovación', key: 'fecha_renovacion', width: 20 },
            { header: 'Estado Equipo', key: 'estado_equipo', width: 20 }
        ]);

        addSheetWithData(workbook, 'Empleados', resultsEmpleado, [
            { header: 'ID Empleado', key: 'id_empleado', width: 15 },
            { header: 'Nombre Empleado', key: 'nombre_empleado', width: 20 },
            { header: 'No. Empleado', key: 'no_empleado', width: 15 },
            { header: 'Área', key: 'area', width: 20 },
            { header: 'Estado Empleado', key: 'estado_empleado', width: 20 }
        ]);

        addSheetWithData(workbook, 'Licencias', resultsLicencias, [
            { header: 'ID Licencia', key: 'id_licencia', width: 15 },
            { header: 'Nombre', key: 'nombre', width: 20 },
            { header: 'Tipo Licencia', key: 'tipo_licencia', width: 20 },
            { header: 'Keycode', key: 'keycode', width: 20 },
            { header: 'Fecha de Compra', key: 'fecha_compra', width: 20 },
            { header: 'Fecha de Renovación', key: 'fecha_renovacion', width: 20 },
            { header: 'Proveedor', key: 'proveedor', width: 20 },
            { header: 'Comentario', key: 'comentario', width: 30 },
            { header: 'ID Equipo Asociado', key: 'id_equipo2', width: 15 }
        ]);

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=Registros.xlsx');

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.log(error);
        res.status(500).send('Error al generar el archivo Excel');
    }
});

module.exports = router; // Exporta la instancia del enrutador para su uso en otros archivos. 
