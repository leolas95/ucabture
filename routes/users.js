const express = require('express');
const router = express.Router();
const User = require('../schemas/user');
const bcrypt = require('bcrypt');
const saltRounds = 5;
const upload = require('../config/multer');
const cloudinary = require('../config/cloudinary');

// Endpoint para subir una imagen
router.post('/upload',
  upload.single('image'),
  (req, res, next) => {

    // Guarda la imagen en el hosting de cloudinary
    let imageData;
    cloudinary.v2.uploader.upload_stream(
      function (error, result) {
        imageData = {
          description: req.body.description,
          emoji: req.body.emoji,
          lat: req.body.lat,
          lng: req.body.lng,
          url: result.url,
        }

        // Agrega la imagen al registro de fotos del usuario
        User.findOne({ username: req.body.username }, (err, user) => {
          if (err) {
            console.log('Error al guardar imagen');
            return res
              .status(500)
              .json({ status: 'Error', message: 'Hubo un error en el servidor al guardar la imagen:' });
          }

          // Verifica que el usuario exista
          if (!user) {
            console.log(`${req.body.username} no existe`);

            return res
              .status(404)
              .json({ status: 'Error', message: 'El usuario especificado no existe!' });
          }

          user.images.push(imageData);
          user.save();
          res
            .status(201)
            .json({ status: 'OK', message: 'Imagen almacenada correctamente' });
        });

      }).end(req.file.buffer);
  });

// Endpoint para obtener el feed del usuario
router.get('/:username/feed', (req, res) => {
  const username = req.params.username;

  User.findOne({ username: username }, (err, user) => {
    if (err) {
      console.log('Error al obtener feed de', username);
      res
        .status(400)
        .json({ status: 'Error', message: 'Hubo un error al obtener el feed del usuario' });
    }


    if (!user) {
      return res
        .status(404)
        .json({ 'status': 'Error', message: 'El usuario especificado no existe!' });
    }

    res
      .status(200)
      .json({ images: user.images });
  });
});

router.get('/', function (req, res) {
  User.find({}, { _id: 0, __v: 0 }, (err, users) => {
    if (err) {
      return res.status(500).json({ status: 'Error', message: 'Error interno del servidor al obtener usuarios' });
    }

    res.status(200).json({ status: 'OK', users: users });
  })
});

// Endpoint para login
router.post('/login', function (req, res) {

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
          res
            .status(200)
            .json({ status: "OK", message: "Sesion iniciada correctamente" });
        } else {
          console.log('Clave incorrecta');
          res
            .status(400)
            .json({ status: "Error", message: "Clave incorrecta" });
        }
      } else {
        console.log(`Usuario ${username} no existe`);
        res
          .status(400)
          .json({ status: "Error", message: "No puede iniciar sesion, el usuario especificado no esta registrado" });
      }
    });
  } else {
    res
      .status(400)
      .json({ status: "Error", message: "Los campos no deben estar vacios" });
  }
});

// Endpoint para registrar al usuario
router.post('/signup', function (req, res) {
  const name = req.body.name;
  const lastname = req.body.lastname;
  const username = req.body.username;
  const password = req.body.password;
  const email = req.body.email;
  const group = req.body.group;

  if (!name || !lastname || !username || !password || !email || !group ||
    !name.trim() || !lastname.trim() || !username.trim() || !password.trim() || !email.trim() || !group.trim()) {
    return res.status(400).json({ message: 'Los campos no pueden estar vacios' });
  }

  // Busca a ver si el usuario ya existe
  User.findOne({ username: username }, (err, user) => {
    if (err) {
      return res.status(500).end();
    }

    // Si es asi, entonces no puede registrarse
    if (user) {
      console.log(`${user.name} ${user.lastname} ya existe`);
      res
        .status(400)
        .json({ status: "Error", message: "User already exists" });
    } else {
      // Sino, crea al nuevo usuario
      console.log('Nuevo usuario');

      // Guarda la clave encriptada en la base de datos
      bcrypt.hash(password, saltRounds, function (err, hash) {

        const userData = {
          name: name,
          lastname: lastname,
          username: username,
          password: hash,
          email: email,
          group: group,
        };

        User.create(userData, function (err, newUser) {
          if (err) {
            console.log('Error al crear usuario');
            throw err;
          } else {
            console.log(`Usuario ${newUser.username} creado con exito`);
            res
              .status(201)
              .json({ status: "OK", message: "User created succesfully!" });
          }
        });
      });
    }
  });
});

module.exports = router;
