var express = require('express');

var fileUpload = require('express-fileupload');
var fs = require('fs');
var app = express();

var Usuario = require('../models/usuario');

var Medico = require('../models/medico');

var Hospital = require('../models/hospital');

// default options
app.use(fileUpload());


app.put('/:tipo/:id', (req, res, next) => {

    var tipo = req.params.tipo;
    var id = req.params.id;

    //tipos de coleccion

    var tiposValidos = ['hospitales', 'medicos', 'usuarios'];
    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({ // si hay un error
            ok: false,
            mensaje: 'Tipo de coleccion no es valida',
            errors: { message: 'Tipo de coleccion no es valida' }
        });

    }

    if (!req.files) {
        return res.status(400).json({ // si hay un error
            ok: false,
            mensaje: 'Error cargando archivo!',
            errors: { message: 'Debe de seleccionar una imagen' }
        });
    }

    // obtener nombre del archivo

    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extensionArchivo = nombreCortado[nombreCortado.length - 1];

    //Solo estas extensiones aceptamos

    var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if (extensionesValidas.indexOf(extensionArchivo) < 0) {
        return res.status(400).json({ // si hay un error
            ok: false,
            mensaje: 'Extension no valida',
            errors: { message: 'La extensiones validas son ' + extensionesValidas.join(', ') }
        });
    }

    // Nombre del Archivo personalizado

    var nombreArchivo = `${ id }-${ new Date().getMilliseconds()}.${ extensionArchivo }`;

    // mover el archivo del temporal a un path

    var path = `./uploads/${ tipo }/${ nombreArchivo }`;

    archivo.mv(path, err => {
        if (err) {
            return res.status(500).json({ // si hay un error
                ok: false,
                mensaje: 'Error al mover archivo',
                errors: err
            });
        }

        subirPorTipo(tipo, id, nombreArchivo, res);

        // res.status(200).json({
        //     ok: true,
        //     mensaje: 'Archivo movido!',
        //     extensionArchivo: extensionArchivo
        // });

    })




});


function subirPorTipo(tipo, id, nombreArchivo, res) {

    if (tipo === 'usuarios') {

        Usuario.findById(id, (err, usuario) => {

            if (!usuario) {

                return res.status(400).json({
                    ok: true,
                    mensaje: 'Usuario no existe',
                    errors: { message: 'Usuario no existe' }
                });

            }


            var pathViejo = './uploads/usuarios/' + usuario.img;

            //si existe, elimina la imagen anterior

            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);
            }

            usuario.img = nombreArchivo;

            usuario.save((err, usuarioActualizado) => {

                usuarioActualizado.password = ':)';

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de usuario actualizada',
                    usuario: usuarioActualizado
                });

            })

        });

    }

    if (tipo === 'medicos') {

        Medico.findById(id, (err, medico) => {


            if (!medico) {

                return res.status(400).json({
                    ok: true,
                    mensaje: 'medico no existe',
                    errors: { message: 'medico no existe' }
                });

            }

            var pathViejo = './uploads/medicos/' + medico.img;

            //si existe, elimina la imagen anterior

            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);
            }

            medico.img = nombreArchivo;

            medico.save((err, medicoActualizado) => {

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de usuario actualizada',
                    medico: medicoActualizado
                });

            })

        });
    }
    if (tipo === 'hospitales') {

        Hospital.findById(id, (err, hospital) => {


            if (!hospital) {

                return res.status(400).json({
                    ok: true,
                    mensaje: 'hospital no existe',
                    errors: { message: 'hospital no existe' }
                });

            }

            var pathViejo = './uploads/hospitales/' + hospital.img;

            //si existe, elimina la imagen anterior

            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);
            }

            hospital.img = nombreArchivo;

            hospital.save((err, hospitalActualizado) => {

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de usuario actualizada',
                    hospital: hospitalActualizado
                });

            })

        });

    }


}

module.exports = app;