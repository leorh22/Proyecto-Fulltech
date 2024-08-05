function obtenerDatosEquipo(req, res){
    const datosEquipo = req.body;
    
    var tipo_equipo = datosEquipo.tipo_equipo;
    var marca = datosEquipo.marca_equipo;
    var modelo = datosEquipo.modelo;
    var no_serie = datosEquipo.no_serie;
    var sistema_operativo = datosEquipo.sistema_operativo;
    var propietario = datosEquipo.propietario_equipo;
    var linea_telefonica = datosEquipo.linea_telefonica;
    var pin = datosEquipo.pin_equipo
    var imei = datosEquipo.imei_equipo;
    var cuenta_google = datosEquipo.cuenta_google;
    var password_cuenta = datosEquipo.password_cuenta;
    var fecha_compra = datosEquipo.fecha_compra;
    var fecha_renovacion = datosEquipo.fecha_renovacion;
    var estado_equipo = datosEquipo.estado_equipo;

    return{
        tipo_equipo:tipo_equipo, 
        marca:marca, 
        modelo:modelo,
        no_serie:no_serie, 
        sistema_operativo:sistema_operativo, 
        propietario:propietario, 
        linea_telefonica:linea_telefonica,
        pin:pin, 
        imei:imei, 
        cuenta_google:cuenta_google,
        password_cuenta:password_cuenta, 
        fecha_compra:fecha_compra, 
        fecha_renovacion:fecha_renovacion,
        estado_equipo:estado_equipo
    }
}

module.exports = obtenerDatosEquipo;