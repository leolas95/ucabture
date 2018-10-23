const express = require('express');
const router = express.Router();
const User = require('../schemas/user');
const bcrypt = require('bcrypt');
const saltRounds = 5;
/*const multer = require('multer');

// Configuracion de almacenamiento para multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'images/');
    },

    filename: function (req, file, cb) {
        cb(null, new Date().toTimeString() + file.originalname);
    }
});

const upload = multer({ storage: storage });

router.post('/upload', upload.single('image'), (req, res, next) => {
    console.log(req.body);
    res
        .status(200)
        .contentType('application/json')
        .json({ status: 'OK', message: 'Image stored succesfully' });
});*/

router.get('/', function (req, res) {
    res.status(200);
    res.type('html');
    res.end('<h1>Pagina de prueba. Aqui no va nada</h1>');
});

// Endpoint para login
router.post('/login', function (req, res) {
    console.log('POST login');
    console.log(req.body);

    const username = req.body.username;
    const password = req.body.password;

    if (username && password) {

        User.findOne({ username: username }, function (err, user) {
            if (err) throw err;

            if (user) {
                console.log(`${username} existe`);
                console.log(user.isValidPassword(password));

                // Verifica que la clave sea valida
                if (user.isValidPassword(password)) {
                    console.log('Fino puede pasar');
                    res.status(200)
                        .contentType('application/json')
                        .json({ "status": "OK", "message": "Logged in succesfully!" });
                } else {
                    console.log('Clave incorrecta');
                    res.status(400)
                        .contentType('application/json')
                        .json({ "status": "Error", "message": "Password does not match" });
                }
            } else {
                console.log(`Usuario ${username} no existe`);
                res.status(400);
                res.contentType('application/json')
                res.json({ "status": "Error", "message": "Could not log in, user does not exists" });
            }
        });
    } else {
        res.status(400);
        res.contentType('application/json')
        res.json({ "status": "Error", "message": "Fields must not be empty" });
    }
});

router.post('/signup', function (req, res) {
    console.log('POST signup');
    // Por ahora asumimos que todos los campos estan presentes
    const name = req.body.name;
    const lastname = req.body.lastname;
    const username = req.body.username;
    const password = req.body.password;
    const email = req.body.email;

    // Busca a ver si el usuario ya existe
    User.findOne({ username: username }, (err, user) => {
        if (err) {
            console.log('Error al registrarse');
            throw err;
        }

        // Si es asi, entonces no puede registrarse
        if (user) {
            console.log(`${user.name} ${user.lastname} ya existe`);
            res.status(400);
            res.contentType('application/json');
            res.json({ "status": "Error", "message": "User already exists" });
        } else {
            // Sino, crea al nuevo usuario
            console.log('Nuevo usuario');

            // Guarda la clave encriptada en la base de datos
            bcrypt.hash(password, saltRounds, function (err, hash) {
                console.log(password);
                console.log(hash);

                const userData = {
                    name: name,
                    lastname: lastname,
                    username: username,
                    password: hash,
                    email: email
                };

                User.create(userData, function (err, newUser) {
                    if (err) {
                        console.log('Error al crear usuario');
                        throw err;
                    } else {
                        console.log(`Usuario ${newUser.username} creado con exito`);
                        res.status(200);
                        res.contentType('application/json');
                        res.json({ "status": "OK", "message": "User created succesfully!" });
                    }
                });
            });
        }
    });

    console.log(req.body);
});

module.exports = router;