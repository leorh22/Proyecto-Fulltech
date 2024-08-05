var express = require('express'); // Importa el módulo Express.
var path = require('path'); // Importa el módulo PATH.
const session =  require('express-session');

// Importa las rutas de diferentes secciones de la aplicación.
var inventarioGeneralRutas = require("./routes/inventarioGeneralRutas");
var siteRutas = require("./routes/siteRutas");
var empleadoRutas = require("./routes/empleadoRutas");
var loginRutas = require("./routes/login");
var equipoRutas = require("./routes/equipoRutas");
var licenciaRutas = require("./routes/licenciaRutas");
var authMiddleware = require("./middleware/auth");

// Crea una instancia de la aplicación Express, que se usará para configurar y manejar el servidor y las rutas.
const app = express();

// Configura la ruta de la carpeta 'views', que contiene las plantillas de vista. 
app.set('views', path.join(__dirname, 'views'));

// Establece EJS como el motor de vistas predeterminado para la aplicación Express.
// Esto permite renderizar archivos '.ejs' cuando se manejan las solicitudes HTTP.
app.set('view engine', 'ejs');

app.use(express.json());  
app.use(express.urlencoded({extended:false}));

const dotenv = require('dotenv');
dotenv.config({path:'./env/.env'});

app.use(session({
    secret: 'secret',
    resave: true, 
    saveUninitialized: true
}));

app.use((req, res, next) => {
    res.locals.username = req.session.nombre || '';
    next();
});

// Rutas
//app.use('/', authMiddleware.isAuthenticated, inventarioGeneralRutas);
app.use('/site', authMiddleware.isAuthenticated, siteRutas);
app.use('/equipo', authMiddleware.isAuthenticated, equipoRutas);
app.use('/empleado', authMiddleware.isAuthenticated, empleadoRutas);
app.use('/licencia', authMiddleware.isAuthenticated, licenciaRutas);
app.use(loginRutas);

app.use(inventarioGeneralRutas);
app.use(siteRutas);
app.use(empleadoRutas);
app.use(equipoRutas);
app.use(licenciaRutas);

// Rutas estaticas
app.use(express.static(path.join(__dirname, 'public'))); // Sirve archivos estáticos desde la carpeta 'public'.

// Asigna el puerto en el que se ejecutará el servidor. Si hay una variable de entorno 'PORT' definida, usa ese valor,
// de lo contrario, usa el puerto 3000.
var port = process.env.PORT || 3000;  

// Inicia el servidor en el puerto especificado y muestra un mensaje en la consola indicando la URL del servidor.
app.listen(port, () => {
    console.log('Server on http://localhost:' + port);
});

// "npm start" es el comando para iniciar el servidor desde la terminal
