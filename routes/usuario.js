var express = require('express');

var app = express();

var mdAutenticacion = require('../middlewares/autenticacion');

var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var Usuario = require('../models/usurio');
// var SEED = require('../config/config').SEED;

// ===============================
// Obtener todos los usuarios
// ===============================

app.get('/', (req, res, next) => {

    Usuario.find({}, 'nombre email img role') // lo que nos va salir
        .exec(
            (err, usuarios) => {
                if (err) {
                    return res.status(500).json({ // si hay un error
                        ok: false,
                        mensaje: 'Error cargando usurios!',
                        errors: err
                    });
                }
                res.status(200).json({ // si todo funciona correctamente
                    ok: true,
                    usuarios: usuarios
                });

            });

});




//=========================
// Actualizar usuario
//=========================

app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Usuario.findById(id, (err, usuario) => {


        if (err) {
            return res.status(500).json({ // si hay un error
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }

        if (!usuario) {
            return res.status(400).json({ // si hay un error
                ok: false,
                mensaje: 'El usuario con el id ' + id + ' no existe',
                errors: { message: 'No existe un usuario con ese ID' }
            });
        }

        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        usuario.save((err, usuarioGuardado) => {

            if (err) {
                return res.status(400).json({ // si hay un error
                    ok: false,
                    mensaje: 'Error al actualizar usuario',
                    errors: err
                });
            }

            usuarioGuardado.password = ":)";

            res.status(200).json({ // si todo funciona correctamente
                ok: true,
                usuario: usuarioGuardado
            });

        });

    });

});


//=========================
// crear un nuevo usuario
//=========================

app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    var body = req.body;

    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    usuario.save((err, usuarioGuardado) => {
        if (err) {
            return res.status(400).json({ // si hay un error
                ok: false,
                mensaje: 'Error al crear usuario',
                errors: err
            });
        }

        res.status(201).json({ // si todo funciona correctamente
            ok: true,
            usuario: usuarioGuardado,
            usuarioToken: req.usuario
        });

    });


})



//=========================
// Borrar un usuario por el id
//=========================

app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;

    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {

        if (err) {
            return res.status(500).json({ // si hay un error
                ok: false,
                mensaje: 'Error al borrar usuario',
                errors: err
            });
        }


        if (!usuarioBorrado) {
            return res.status(400).json({ // si hay un error
                ok: false,
                mensaje: 'No existe un usuario con ese id',
                errors: { message: 'No existe un usuario con ese id' }
            });
        }

        res.status(200).json({ // si todo funciona correctamente
            ok: true,
            usuario: usuarioBorrado
        });

    });

});

module.exports = app;