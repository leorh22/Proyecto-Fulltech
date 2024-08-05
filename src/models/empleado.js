function obtenerDatosEmpleado(req, res){
    const datosEmpleado = req.body;

    var nombre_empleado = datosEmpleado.nom_emp;
    var numero_empleado = datosEmpleado.num_emp;
    var area_empleado = datosEmpleado.area_emp;
    var estado_empleado = datosEmpleado.est_emp;

    return{
        nombre_empleado: nombre_empleado, 
        numero_empleado: numero_empleado, 
        area_empleado: area_empleado, 
        estado_empleado: estado_empleado
    };
}

module.exports = obtenerDatosEmpleado;