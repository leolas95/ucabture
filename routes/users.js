const express = require('express');
const router = express.Router();
const User = require('../schemas/user');
const bcrypt = require('bcrypt');
const saltRounds = 5;
const upload = require('../config/multer');
const cloudinary = require('../config/cloudinary');

/*const fs = require('fs');

router.post('/up', upload.single('img'), (req, res) => {
  let buf = Buffer.from(req.body.img, 'base64');
  let wstream = fs.createWriteStream('foo.png');
  wstream.write(buf);
  wstream.end();
  res.sendStatus(200);
  
});*/

// Endpoint para subir una imagen
router.post('/upload',
  upload.single('image'),
  (req, res, next) => {

    let description = req.body.description;
    let emoji = req.body.emoji;
    let lat = req.body.lat;
    let lng = req.body.lng;
    let date = req.body.date;
    let username = req.body.username;

    console.log('desc =', description);
    console.log('emoji =', emoji);
    console.log('lat =', lat);
    console.log('lng =', lng);
    console.log('date =', date);
    console.log('username =', username);
    console.log('req.file =', req.file);
    

    // Valida que los campos no esten vacios
    if (!description || !emoji || !lat || !lng || !date || !username ||
      !description.trim() || !emoji.trim() || !lat.trim() ||
      !lng.trim() || !date.trim() || !username.trim()) {
      return res.status(400).json({ status: 'Error', message: 'Los campos no pueden estar vacios' });
    }

    if (emoji < 1 || emoji > 6) {
      return res.status(400).json({ status: 'Error', message: 'El valor del emoji debe estar entre 1 y 6' });
    }

    if (req.file === undefined || req.file.buffer === undefined) {
      return res.status(400).json({ status: 'Error', message: 'El campo de la imagen no debe estar vacio' });
    }

    // Elimina los espacios en blanco de los campos
    description = description.trim();
    emoji = emoji.trim();
    lat = lat.trim();
    lng = lng.trim();
    date = date.trim();
    username = username.trim();

    // Guarda la imagen en el hosting de cloudinary
    let imageData;
    cloudinary.v2.uploader.upload_stream(
      function (error, result) {
        imageData = {
          description: description,
          emoji: emoji,
          lat: lat,
          lng: lng,
          date: date,
          url: result.url,
        }

        // Agrega la imagen al registro de fotos del usuario
        User.findOne({ username: username }, (err, user) => {
          if (err) {
            console.log('Error al guardar imagen');
            return res
              .status(500)
              .json({ status: 'Error', message: 'Hubo un error en el servidor al guardar la imagen:' });
          }

          // Verifica que el usuario exista
          if (!user) {
            console.log(`${username} no existe`);

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
  let username = req.params.username;

  if (!username || !username.trim()) {
    return res.status(400).json({ status: 'Error', message: 'El campo username no puede estar vacio' });
  }

  username = username.trim();

  User.findOne({ username: username }, (err, user) => {
    if (err) {
      console.log('Error al obtener feed de', username);
      return res.status(400).json({ status: 'Error', message: 'Hubo un error al obtener el feed del usuario' });
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

  let username = req.body.username;
  let password = req.body.password;

  if (!username || !username.trim() || !password || !password.trim()) {
    return res.status(400).json({ status: 'Error', message: 'Los campos username y password no pueden estar vacios' });
  }

  // Elimina los espacios en blanco de los campos
  username = username.trim();
  password = password.trim();

  User.findOne({ username: username }, function (err, user) {
    if (err) {
      return res.status(500).json({ status: 'Error', message: 'Error interno del servidor al hacer login' });
    }

    if (user) {
      console.log(`${username} existe`);
      console.log(user.isValidPassword(password));

      // Verifica que la clave sea valida
      if (user.isValidPassword(password)) {
        console.log('Fino puede pasar');
        return res.status(200).json({ status: "OK", message: "Sesion iniciada correctamente" });
      } else {
        console.log('Clave incorrecta');
        return res.status(400).json({ status: "Error", message: "Clave incorrecta" });
      }
    } else {
      console.log(`Usuario ${username} no existe`);
      return res.status(400).json({ status: "Error", message: "No puede iniciar sesion, el usuario especificado no esta registrado" });
    }
  });
});

// Endpoint para registrar al usuario
router.post('/signup', function (req, res) {
  let name = req.body.name;
  let lastname = req.body.lastname;
  let username = req.body.username;
  let password = req.body.password;
  let email = req.body.email;
  let group = req.body.group;

  if (!name || !lastname || !username || !password || !email || !group ||
    !name.trim() || !lastname.trim() || !username.trim() || !password.trim() || !email.trim() || !group.trim()) {
    return res.status(400).json({ message: 'Los campos no pueden estar vacios' });
  }

  // Elimina los espacios en blanco de los campos
  name = name.trim();
  lastname = lastname.trim();
  username = username.trim();
  password = password.trim();
  email = email.trim();
  group = group.trim();

  // Busca a ver si el usuario ya existe
  User.findOne({ username: username }, (err, user) => {
    if (err) {
      return res.status(500).json({ status: 'Error', message: 'Error interno del servidor al registrar usuario' });
    }

    // Si es asi, entonces no puede registrarse
    if (user) {
      console.log(`${user.name} ${user.lastname} ya existe`);
      return res.status(400).json({ status: "Error", message: "User already exists" });
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
            return res.status(500).json({ status: 'Error', message: 'Error interno del servidor al crear usuario' });
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
