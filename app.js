const express = require('express');
const app = express();
const db = require('./db/db');
const User = require('./schemas/user');

const PORT = process.env.PORT || 3000

app.use(express.urlencoded({ extended: true }));

app.post('/login', function (req, res) {
    console.log('POST login');
    console.log(req.body);

    const username = req.body.username;
    const password = req.body.password;

    if (username && password) {
        User.findOne({ username: username }, function (err, user) {
            if (err) throw err;

            if (user) {
                console.log(`${username} existe`);
                if (user.password === password) {
                    console.log('Fino puede pasar');
                    res.status(200);
                    res.contentType('application/json')
                    res.json({ "status": "OK", "message": "Logged in succesfully!" });
                } else {
                    console.log('Clave incorrecta');
                    res.status(400);
                    res.contentType('application/json')
                    res.json({ "status": "Error", "message": "Password does not match" });
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

app.post('/signup', function (req, res) {
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
            const userData = {
                name: name,
                lastname: lastname,
                username: username,
                password: password,
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
        }
    });

    console.log(req.body);
})


app.listen(PORT, function () {
    console.log(`Server listening on port ${PORT}`);
});