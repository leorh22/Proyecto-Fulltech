const router = require("express").Router(); // Crea una instancia del enrutador de Express.
const conexion = require("../db/conexion");
const bcryptjs = require('bcryptjs');

router.get("/login", (req, res) => {
    res.render("login/login.ejs");
});

router.get("/registrar", (req, res) => {
    res.render("login/registro.ejs");
});

router.post("/registrarUsuario", async (req, res) =>{
    const nombre = req.body.nombre;
    const correo_electronico = req.body.correo_electronico;
    const password_admin = req.body.password_admin;
    let passwordHash = await bcryptjs.hash(password_admin, 8);

    conexion.query('INSERT INTO administrador SET ?', {nombre:nombre, correo_electronico:correo_electronico, password_admin:passwordHash}, async(error, results) => {
        if(error){
            console.log(error);
        } else{
            res.render("login/registro", {
                alert: true, 
                alertTitle: "¡REGISTRADO EXITOSAMENTE!", 
                alertMessage: "¡REGISTRO EXITOSO!", 
                alertIcon: "success", 
                timer: 1500, 
                ruta: "login"
            });
            console.log("Usuario guardado correctamente")
        }
    });
});

router.post("/auth", async (req, res) => {
    const correo_electronico = req.body.correo_electronico;
    const password_admin = req.body.password_admin;

    if(correo_electronico && password_admin){
        conexion.query('SELECT * FROM administrador WHERE correo_electronico = ?', [correo_electronico], async (error, results) => {
            if(results.length == 0 || !(await bcryptjs.compare(password_admin, results[0].password_admin))){
                res.render("login/login", {
                    alert: true,
                    alertTitle: "ERROR", 
                    alertMessage: "USUARIO Y/O CONTRASEÑA INCORRECTOS",
                    alertIcon: "error", 
                    timer: false, 
                    ruta: 'login'
                });
            } else{
                req.session.loggedin = true;
                req.session.nombre = results[0].nombre; // Almacena el nombre en la sesión
                res.render("login/login", {
                    alert: true,
                    alertTitle: "CONEXIÓN EXITOSA", 
                    alertMessage: "LOGIN CORRECTO",
                    alertIcon: "success", 
                    timer: 1500, 
                    ruta: ''
                });
            }
        });
    } else{
        res.render("login/login", {
            alert: true,
            alertTitle: "ADVERTENCIA", 
            alertMessage: "INGRESA EL CORREO Y/O CONTRASEÑA",
            alertIcon: "warning", 
            timer: 2000, 
            ruta: 'login'
        });
    }
});

router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if(err){
            console.log(err);
        } else{
            res.redirect('/login');
        }       
    });
});

module.exports = router; // Exporta la instancia del enrutador para su uso en otros archivos.
