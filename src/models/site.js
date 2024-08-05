function obtenerDatosSite(req, res){
    const datosSite = req.body;

    var dispositivo = datosSite.disp;
    var tipo_dispositivo = datosSite.tipo_disp;
    var marca = datosSite.marca_disp;
    var modelo = datosSite.modelo_disp;
    var numero_serie = datosSite.num_serie;
    var comentario = datosSite.comentario_disp;
    var estado_dispositivo = datosSite.estado_disp;

    return{
        dispositivo: dispositivo,
        tipo_dispositivo: tipo_dispositivo,
        marca: marca,
        modelo: modelo,
        numero_serie: numero_serie,
        comentario: comentario,
        estado_dispositivo: estado_dispositivo
    }
}

module.exports = obtenerDatosSite;