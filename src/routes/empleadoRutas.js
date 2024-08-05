const router = require("express").Router(); // Crea una instancia del enrutador de Express.
const conexion = require("../db/conexion");
const obtenerDatosEmpleado = require("../models/empleado");
const PDFDocument = require('pdfkit');
const moment = require('moment');
const path = require('path');
const authMiddleware = require('../middleware/auth'); 

/* router.get('/empleado', (req, res) => {
    const sql = "SELECT * FROM empleado";

    conexion.query(sql, (err, data) => {
        if(err){
            throw err;
        } else{
            res.render("empleado_views/mostrar", {title: "Empleado", empleadoData: data})
        }
    });
});  */

router.get('/empleado', authMiddleware.isAuthenticated, (req, res) => {
    const sql = "SELECT * FROM empleado";

    conexion.query(sql, (err, data) => {
        if(err){
            throw err;
        } else{
            res.render("empleado_views/mostrar", {title: "Empleado", empleadoData: data})
        }
    });
});

router.get('/detallesEmpleado/:id', authMiddleware.isAuthenticated, (req, res) => {
    const id = req.params.id;

    const sqlEmpleado = "SELECT * FROM empleado WHERE id_empleado = ?";
    const sqlEquipos = `
    SELECT tipo_equipo, marca, modelo, no_serie, 
           DATE_FORMAT(fecha_asignacion, '%d-%m-%Y') AS fecha_asignacion
    FROM registro
    INNER JOIN equipo ON registro.id_equipo1 = equipo.id_equipo
    WHERE registro.id_empleado1 = ?
`;

    conexion.query(sqlEmpleado, [id], (errorEmpleado, empleadoResults) => {
        if (errorEmpleado) throw errorEmpleado;

        conexion.query(sqlEquipos, [id], (errorEquipos, equiposResults) => {
            if (errorEquipos) throw errorEquipos;

            res.render('empleado_views/detalles', { 
                empleado: empleadoResults[0], 
                equipos: equiposResults 
            });
        });
    });
});

router.get('/nuevoEmpleado', authMiddleware.isAuthenticated, (req, res) => {
    res.render("empleado_views/nuevo");
});

router.post('/insertarDatosEmpleado', (req, res) => {
    const {nombre_empleado, numero_empleado, area_empleado, estado_empleado} = obtenerDatosEmpleado(req, res);
    
    var registrarEmpleado = "INSERT INTO empleado (nombre_empleado, no_empleado, area, estado_empleado) VALUES ('"+nombre_empleado+"','"+numero_empleado+"','"+area_empleado+"','"+estado_empleado+"')";

    conexion.query(registrarEmpleado, (err) => {
        if(err) {
            throw err;
        } else {
            console.log("Datos almacenados correctamente");
            res.redirect('/empleado');
        }
    });
});

router.get('/editarEmpleado/:id', authMiddleware.isAuthenticated, (req, res) => {
    const id = req.params.id;
    conexion.query('SELECT * FROM empleado WHERE id_empleado = ?',[id], (error, results) =>{
        if(error){
            throw error;
        } else{
            res.render('empleado_views/editar', {data:results[0]});
        }
    });
});

router.post('/actualizarEmpleado', (req, res) => {
    const id_empleado = req.body.id;
    const nombre_empleado = req.body.nom_emp;
    const numero_empleado = req.body.num_emp;
    const area_emp = req.body.area_emp;
    const estado_empleado = req.body.est_emp;

    conexion.query('UPDATE empleado SET ? WHERE id_empleado = ?', [{nombre_empleado:nombre_empleado, no_empleado:numero_empleado, area:area_emp, estado_empleado:estado_empleado}, id_empleado], (error, results) => {
        if(error){
            console.log(error);
        } else{
            console.log('Empleado actualizado correctamente');
            res.redirect('/empleado');
        }
    });
});

router.get('/eliminarEmpleado/:id', authMiddleware.isAuthenticated, (req, res) =>{
    const id_empleado = req.params.id;

    const eliminarEmpleado = "DELETE FROM empleado WHERE id_empleado = ?";

    conexion.query(eliminarEmpleado, id_empleado, (err) => {
        if(err){
            console.error(err);
            res.status(500).send("Error al eliminar el empleado");
        } else{
            console.log("Empleado eliminado correctamente");
            res.redirect('/empleado');
        }
    });
});

router.get('/detallesEmpleado/:id/pdf', (req, res) => {
    const id = req.params.id;

    const sqlEmpleado = "SELECT * FROM empleado WHERE id_empleado = ?";
    const sqlEquipos = `
        SELECT tipo_equipo, marca, modelo, no_serie, fecha_asignacion
        FROM registro
        INNER JOIN equipo ON registro.id_equipo1 = equipo.id_equipo
        WHERE registro.id_empleado1 = ?
    `;

    conexion.query(sqlEmpleado, [id], (errorEmpleado, empleadoResults) => {
        if (errorEmpleado) throw errorEmpleado;

        conexion.query(sqlEquipos, [id], (errorEquipos, equiposResults) => {
            if (errorEquipos) throw errorEquipos;

            const doc = new PDFDocument({ margin: 20 });
            let filename = `detalles_empleado_${empleadoResults[0].no_empleado}.pdf`;
            filename = encodeURIComponent(filename);

            res.setHeader('Content-disposition', 'inline; filename="' + filename + '"');
            res.setHeader('Content-Type', 'application/pdf');
            
            doc.pipe(res); // Aquí se envía el PDF a la respuesta

            //Ruta estatica de la imagen
            const imagePath = path.join(__dirname, '..', 'public', 'img', 'fulltech-logo-fondo-blanco.jpg');

            // Variables del encabezado
            const headerLeft = doc.page.margins.left;
            const headerTop = doc.page.margins.top;
            const headerWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;

            // Ancho de las columnas
            const column1Width = headerWidth * 0.3;
            const column2Width = headerWidth * 0.7;

            // Altura de las filas
            const rowHeightEncabezado = 20;

            // Dibujar el cuadro del encabezado
            doc.rect(headerLeft, headerTop, headerWidth, rowHeightEncabezado * 2).stroke();

            // Dibujar las líneas internas
            doc.moveTo(headerLeft + column1Width, headerTop)
                .lineTo(headerLeft + column1Width, headerTop + rowHeightEncabezado * 2)
                .stroke();

            doc.moveTo(headerLeft, headerTop + rowHeightEncabezado)
                .lineTo(headerLeft + headerWidth, headerTop + rowHeightEncabezado)
                .stroke();

            // Añadir el logo
            doc.image(imagePath, headerLeft + 1, headerTop + 1, { width: column1Width - 2, height: rowHeightEncabezado + 18 });

            // Añadir el texto en la segunda columna, primera fila
            doc.fontSize(12)
                .font('Helvetica-Bold')
                .text('FULLTECH CASTING DE MÉXICO S. DE R. L. DE C. V.', headerLeft + column1Width, headerTop + 5, { width: column2Width, align: 'center' });

            // Añadir el texto en la segunda columna, segunda fila
            doc.fontSize(10)
                .font('Helvetica')
                .text('RESPONSIVA', headerLeft + column1Width, headerTop + rowHeightEncabezado + 5, { width: column2Width, align: 'center' });

            doc.moveDown(1.5);

            // Ciudad y fecha
            const city = "                                                                                Querétaro, Qro. a";
            const date = new Date().toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });

            doc.text(city, { continued: true});
            doc.font('Helvetica-Bold').text(` ${date}`, { continued: false});

            doc.font('Helvetica');
            
            doc.moveDown(1);

            // Información del empleado
            doc.font('Helvetica-Bold').fontSize(14).text('Departamento de Sistemas', 30);
            doc.moveDown(0.5);
            doc.text('Fulltech Casting de México S. de R. L. de C. V.', 30);
            doc.font('Helvetica').fontSize(12);
            doc.text('Se entrega lo siguiente a:', 30);

            doc.moveDown(0.5);

             //Tabla de empleado
            const margin = 30;
            const pageWidth = doc.page.width - margin * 2; // Ancho de la página menos márgenes
            const rowHeight = 14;

            // Función para centrar verticalmente el texto
            function centerVerticalText(doc, text, x, y, height, options) {
                const textHeight = doc.heightOfString(text, options);
                const yOffset = (height - textHeight) / 2;
                doc.text(text, x, y + yOffset, options);
            }

            const tableTopEmpleado = doc.y;
            const colWidthsEmpleado = [pageWidth * 0.5, pageWidth * 0.16, pageWidth * 0.34]; // Distribuir ancho de columna 


            // Encabezados de la tabla de empleado
            doc.font('Helvetica-Bold', 9);
            const headersEmpleado = ['EMPLEADO', 'NO. EMPLEADO', 'ÁREA/PUESTO'];
            headersEmpleado.forEach((header, i) => {
                centerVerticalText(doc, header, margin + colWidthsEmpleado.slice(0, i).reduce((a, b) => a + b, 0), tableTopEmpleado, rowHeight, { width: colWidthsEmpleado[i], align: 'center', font: 'Helvetica-Bold', fontSize: 12 });
                doc.rect(margin + colWidthsEmpleado.slice(0, i).reduce((a, b) => a + b, 0), tableTopEmpleado, colWidthsEmpleado[i], rowHeight).stroke();
            });
            doc.rect(margin, tableTopEmpleado, pageWidth, rowHeight).stroke();

            // Datos de la tabla de empleado
            doc.font('Helvetica', 8);
            let rowYEmpleado = tableTopEmpleado + rowHeight;
            const empleadoRow = [
                empleadoResults[0].nombre_empleado,
                empleadoResults[0].no_empleado,
                empleadoResults[0].area
            ];
            empleadoRow.forEach((text, i) => {
                centerVerticalText(doc, text, margin + colWidthsEmpleado.slice(0, i).reduce((a, b) => a + b, 0), rowYEmpleado, rowHeight, { width: colWidthsEmpleado[i], align: 'center' });
                doc.rect(margin + colWidthsEmpleado.slice(0, i).reduce((a, b) => a + b, 0), rowYEmpleado, colWidthsEmpleado[i], rowHeight).stroke();
            });
            doc.rect(margin, rowYEmpleado, pageWidth, rowHeight).stroke();

            // Asegurarse de agregar el siguiente espacio para la tabla de equipos
            doc.moveDown(1.5);

            const marginTable = 30;
            const pageWidthTable = doc.page.width - marginTable * 2;
            const rowHeightTable = 14;

            function drawCustomRow(doc, y, columns, colWidths, highlight = []) {
                let x = marginTable;
            
                // Dibujar el fondo de las celdas
                columns.forEach((col, i) => {
                    if (highlight.includes(col)) {
                        doc.rect(x, y, colWidths[i], rowHeightTable).fill('#bfbfbf');
                    }
                    x += colWidths[i];
                });
            
                x = marginTable; // Reiniciar x para los bordes
                // Dibujar los bordes de las celdas
                columns.forEach((col, i) => {
                    doc.rect(x, y, colWidths[i], rowHeightTable).stroke();
                    x += colWidths[i];
                });
            
                x = marginTable; // Reiniciar x para el texto
                // Dibujar el texto de las celdas
                columns.forEach((col, i) => {
                    const textHeight = doc.heightOfString(col, { width: colWidths[i] - 4, align: 'center' });
                    const yOffset = (rowHeightTable - textHeight) / 2;
                    doc.fillColor('black').text(col, x + 2, y + yOffset, { width: colWidths[i] - 4, align: 'center' });
                    x += colWidths[i];
                });
            }
            
            doc.font('Helvetica-Bold', 12);
            doc.text('Marca en color gris la opción que corresponda:', 30);
            
            doc.moveDown(0.5);
            doc.font('Helvetica', 8);
            
            const tableTopCustom = doc.y;
            
            // Obtener los tipos de equipos
            let tiposEquipos = equiposResults.map(equipo => equipo.tipo_equipo);
            
            // Reglas de dependencias
            if (tiposEquipos.includes('LAPTOP')) {
                tiposEquipos.push('CARGADOR PC');
            }
            if (tiposEquipos.includes('CELULAR')) {
                tiposEquipos.push('CARGADOR CEL');
            }
            if (tiposEquipos.includes('DESKTOP')) {
                tiposEquipos.push('MOUSE', 'MONITOR', 'TECLADO');
            }

            // Fila 1 con 5 columnas
            const columns1 = ['LAPTOP', 'MALETIN', 'MOUSE', 'TECLADO', 'CELULAR'];
            const colWidths1 = [pageWidthTable / 5, pageWidthTable / 5, pageWidthTable / 5, pageWidthTable / 5, pageWidthTable / 5];
            drawCustomRow(doc, tableTopCustom, columns1, colWidths1, tiposEquipos);
            
            // Fila 2 con 5 columnas
            const columns2 = ['RADIO', 'MONITOR', 'DESKTOP', 'CARGADOR PC', 'CARGADOR CEL'];
            const colWidths2 = [pageWidthTable / 5, pageWidthTable / 5, pageWidthTable / 5, pageWidthTable / 5, pageWidthTable / 5];
            drawCustomRow(doc, tableTopCustom + rowHeightTable, columns2, colWidths2, tiposEquipos);
            
            // Fila 3 con 2 columnas
            const columns3 = ['BADGE CARD', 'OTRO'];
            const colWidths3 = [pageWidthTable / 5, pageWidthTable / 5];
            drawCustomRow(doc, tableTopCustom + rowHeightTable * 2, columns3, colWidths3, tiposEquipos);
            
            doc.moveDown(1.2);

            doc.font('Helvetica-Bold', 12);
            doc.text('Información del equipo:', 30);
            
            doc.moveDown(0.5);

            const colWidthsEquipos = [pageWidth * 0.16, pageWidth * 0.2, pageWidth * 0.24, pageWidth * 0.26, pageWidth * 0.14]; // Distribuir ancho de columna
            const tableTopEquipos = doc.y;

            // Encabezados de la tabla de equipos
            doc.font('Helvetica-Bold', 9);
            const headersEquipos = ['TIPO DE EQUIPO', 'MARCA', 'MODELO', 'NÚMERO DE SERIE', 'ASIGNACIÓN'];
            headersEquipos.forEach((header, i) => {
                centerVerticalText(doc, header, margin + colWidthsEquipos.slice(0, i).reduce((a, b) => a + b, 0), tableTopEquipos, rowHeight, { width: colWidthsEquipos[i], align: 'center', font: 'Helvetica-Bold', fontSize: 12 });
                doc.rect(margin + colWidthsEquipos.slice(0, i).reduce((a, b) => a + b, 0), tableTopEquipos, colWidthsEquipos[i], rowHeight).stroke();
            });
            doc.rect(margin, tableTopEquipos, pageWidth, rowHeight).stroke();

            let rowYEquipos = tableTopEquipos + rowHeight;

            // Filas de la tabla de equipos

            doc.font('Helvetica', 8);
            equiposResults.forEach((equipo) => {
                const row = [
                    equipo.tipo_equipo,
                    equipo.marca,
                    equipo.modelo,
                    equipo.no_serie,
                    moment(equipo.fecha_asignacion).format('DD-MM-YYYY')
                ];

                row.forEach((text, i) => {
                    centerVerticalText(doc, text, margin + colWidthsEquipos.slice(0, i).reduce((a, b) => a + b, 0), rowYEquipos, rowHeight, { width: colWidthsEquipos[i], align: 'center' });
                    doc.rect(margin + colWidthsEquipos.slice(0, i).reduce((a, b) => a + b, 0), rowYEquipos, colWidthsEquipos[i], rowHeight).stroke();
                });

                rowYEquipos += rowHeight;
            });

            // Dibujar los bordes exteriores de la tabla de equipos
            doc.rect(margin, tableTopEquipos, pageWidth, rowYEquipos - tableTopEquipos).stroke();
                
            doc.moveDown(0.1);

            doc.font('Helvetica-Bold');
            
            //Terminos y condiciones

            const rectX = margin;
            const rectY = doc.y + 20;
            const rectWidth = pageWidth;
            const rectHeight = 205; // Ajusta esta altura según necesites
            
            // Dibujar el rectángulo
            doc.rect(rectX, rectY, rectWidth, rectHeight).stroke();
            
            // Añadir texto dentro del rectángulo
            const textX = rectX + 10; // Margen interno del texto
            const textY = rectY + 10; // Margen interno del texto
            const textWidth = rectWidth - 20; // Ancho del área de texto menos margen interno
            
            doc.font('Helvetica-Bold').fontSize(10);
            
            // Texto a añadir
            const text = `NOTAS GENERALES

            - En caso de extravío o robo de cualquier opción marcada, favor de avisar al responsable de control; una vez notificado, el titular de la custodia tendrá la responsabilidad de reponer el bien por otro de las mismas especificaciones aplicando descuento vía nómina.
            - El usuario pagará los daños vía nómina ocasionados por caídas, mojadura y/o cualquier motivo que generé daños al equipo (Hardware y Software) que tienen asignados.
            - El usuario tiene PROHIBIDO hacer la instalación de cualquier software sin licencia en el equipo que se le asigne en caso de que se sorprenda, será acreedor de una amonestación. (Si aplica)
            - En caso de perder los accesorios entregados (Cargador del Equipo, Adaptadores, Discos Duros, USB, Maleta, Candado, etc.), el usuario será responsable de reponerlo por completo y/o aplicando descuento vía nómina.
            - Todo documento digital que contenga información relacionada con la empresa es OBLIGATORIO guardarlo en la Red, en el caso de que no se guarde en Red y se pierda, será responsabilidad del usuario.
            ** Al firmar este documento acepta los términos y condiciones de la compañía no descritos en este documento. `;
            
            // Añadir el texto dentro del rectángulo
            doc.text(text, textX, textY, {
              width: textWidth,
              align: 'justify'
            }).fontSize(8);

            doc.moveDown(6);

            // Agregar líneas para las firmas;
            const lineWidth = 200;
            const signatureLineY = doc.y;

            // Dibujar líneas para las firmas
            const signatureX1 = 50;
            const signatureX2 = 350;

            doc.moveTo(signatureX1, signatureLineY).lineTo(signatureX1 + lineWidth, signatureLineY).stroke();
            doc.moveTo(signatureX2, signatureLineY).lineTo(signatureX2 + lineWidth, signatureLineY).stroke();

            // Agregar las etiquetas de las lineas
            doc.moveDown(1);
            doc.fontSize(12);
            doc.text('Nombre y Firma                                                               Nombre y Firma', 110);
            doc.text('Depto. Sistemas/Finanzas                                                               Usuario', 80);

            doc.moveDown(1.5);

            // Observaciones
            doc.font('Helvetica', 11);
            doc.text('Observaciones:', 30);

            doc.moveDown(2);

            const lineWidthObservaciones = doc.page.width - 60; // Ancho de la página menos márgenes
            const observacionesX1 = 30;

            // Dibujar la primera línea de las observaciones
            let observacionesLineY = doc.y;
            doc.moveTo(observacionesX1, observacionesLineY).lineTo(observacionesX1 + lineWidthObservaciones, observacionesLineY).stroke();

            // Añadir espacio antes de la segunda línea
            doc.moveDown(2.5);

            // Dibujar la segunda línea de las observaciones
            observacionesLineY = doc.y;
            doc.moveTo(observacionesX1, observacionesLineY).lineTo(observacionesX1 + lineWidthObservaciones, observacionesLineY).stroke();

            // Finalizar el documento
            doc.end();
        });
    });
});

module.exports = router; // Exporta la instancia del enrutador para su uso en otros archivos.   