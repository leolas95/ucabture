const express = require('express');
const router = express.Router();
const Admin = require('../schemas/admin');
const User = require('../schemas/user');
const bcrypt = require('bcrypt');
const saltRounds = 5;
const firebaseAdmin = require('firebase-admin');
const serviceAccount = require('../ucabture-private-key.json');
const upload = require('../config/multer');
const cloudinary = require('../config/cloudinary');

const acceptedGroups = ['estudiantes', 'proftcompleto', 'proftconvencional', 'egresados', 'empleados'];

//
// Configuracion de Firebase realtime database
//
firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(serviceAccount),
  databaseURL: "https://ucabture-fff32.firebaseio.com"
});

const fdb = firebaseAdmin.database();
const ref = fdb.ref('/users');

router.get('/', (req, res) => {
  Admin.find({}, { _id: 0, __v: 0 }, (err, admins) => {
    if (err) {
      return res.status(500).json({ status: 'Error', message: 'Error interno del servidor al obtener administradores' });
    }

    res.status(200).json({ status: 'OK', admins: admins });
  });
});


// Endpoint para obtener el resumen de publicaciones que se muestran a los admins
router.get('/resume', (req, res) => {
  User.find({}, { images: 1, _id: 0 }, (err, images) => {
    if (err) {
      return res.status(500).json({ status: 'Error', message: 'Error interno del servidor al obtener resumen' });
    }

    res.status(200).json({ resume: images });
  });
});

// Endpoint para obtener el historial de difusiones del admin
router.get('/:username/record', (req, res) => {
  let username = req.params.username;
  if (!username || !username.trim()) {
    return res.status(400).json({ status: 'Error', message: 'Debe indicar un nombre de usuario' });
  }

  // Elimina los espacios en blanco del campo
  username = username.trim();

  Admin.findOne({ username: username }, { broadcasts: 1 }, (err, admin) => {

    if (err) {
      return res.status(500).json({ status: 'Error', message: 'Error interno del servidor al buscar admin' });
    }

    if (!admin) {
      return res.status(404).json({ status: 'Error', message: 'El administrador indicado no existe' });
    }

    res.status(200).json({ record: admin.broadcasts });
  })
})

// Endpoint para que un admin inicie sesion
router.post('/login', (req, res) => {
  let username = req.body.username;
  let password = req.body.password;

  // Verifica que los campos no esten vacios
  if (!username || !password || !username.trim() || !password.trim()) {
    return res.status(400).json({ message: 'Campos de usuario o clave no pueden estar vacios' });
  }

  // Elimina los espacios en blanco de los campos
  username = username.trim();
  password = password.trim();

  // Verifica que el usuario este registrado
  Admin.findOne({ username: username }, (err, admin) => {
    if (err) {
      return res.status(500).end();
    }

    // Si el usuario no existe, retornamos error
    if (!admin) {
      return res.status(404).json({ message: 'El usuario especificado no existe' });
    }

    // Si la clave es correcta, damos acceso
    if (admin.isValidPassword(password)) {
      res.status(200).end();
    } else {
      res.status(400).json({ message: 'La clave ingresada es invalida' });
    }
  });
});

// Endpoint para registrar un nuevo admin
router.post('/signup', (req, res) => {
  let name = req.body.name;
  let lastname = req.body.lastname;
  let username = req.body.username;
  let password = req.body.password;
  let email = req.body.email;

  if (!name || !lastname || !username || !password || !email ||
      !name.trim() || !lastname.trim() || !username.trim() ||
      !password.trim() || !email.trim()) {
    return res.status(400).json({ message: 'Los campos no pueden estar vacios' });
  }

  // Elimina los espacios en blanco de los campos
  name = name.trim();
  lastname = lastname.trim();
  username = username.trim();
  password = password.trim();
  email = email.trim();

  // Verifica que no exista un usuario con el mismo username
  Admin.findOne({ username: username }, (err, admin) => {
    if (err) {
      return res.status(500).end();
    }

    // Verifica que el admin no exista ya en el sistem
    if (admin) {
      return res.status(400).json({ message: 'Ya existe un administrador con ese nombre de usuario' });
    }

    // Si no existe, podemos continuar
    // Creamos el hash de la clave y guardamos al nuevo admin
    bcrypt.hash(password, saltRounds, function (err, hashedPassword) {
      const adminData = {
        name: name,
        lastname: lastname,
        username: username,
        password: hashedPassword,
        email: email,
      };

      Admin.create(adminData, function (err, newAdmin) {
        if (err) {
          return res.status(500).end();
        }

        res.status(200).json({ message: 'Administrador creado con exito!' });
      });
    });
  })

});


// Endpoint para realizar una difusion a los usuarios
router.post('/bcast',
  upload.single('image'),
  (req, res) => {

    let title = req.body.title;
    let description = req.body.description;
    let groups = req.body.groups;
    let username = req.body.username;
    
    if (!title || !description || !groups || !username || !title.trim() || !description.trim() || !groups.trim() || !username.trim()) {
      return res.status(400).json({ status: 'Error', message: 'Los campos no pueden estar vacios' });
    }

    // Elimina los espacios en blanco de los campos
    title = title.trim();
    description = description.trim();
    username = username.trim();

    if (req.file === undefined || req.file.buffer === undefined) {
      return res.status(400).json({ status: 'Error', message: 'El campo de la imagen no debe estar vacio' });
    }

    // Separa los grupos indicados, y elimina los espacios en blanco sobrantes
    groups = groups.split(',');
    groups = groups.map(e => e.trim());

    groups.map(e => {
      if (acceptedGroups.includes(e) === false) {
        return res.status(400).json({ status: 'Error', message: `Uno de los grupos indicados no existe. Los grupos validos son: ${acceptedGroups}` })
      }
    });

    // Guarda la imagen en el hosting de cloudinary
    cloudinary.v2.uploader.upload_stream(
      function (error, result) {

        // Verifica que el admin que subio la imagen exista
        Admin.findOne({ username: username }, (err, admin) => {
          if (err) {
            console.log('Error interno del servidor al guardar imagen');
            return res
              .status(500)
              .json({ status: 'Error', message: 'Hubo un error en el servidor al guardar la imagen:' });
          }

          // Si el administrador no existe, elimina la imagen
          if (!admin) {
            console.log(`Admin ${username} no existe`);

            return res
              .status(404)
              .json({ status: 'Error', message: 'El administrador indicado no existe' });
          }

          // Construye el payload de la difusion
          const bcastPayload = {
            title: title,
            description: description,
            imageUrl: result.url,
            timestamp: Date.now(),
          }

          // Guarda la difusion en el historial de difusiones del admin
          admin.broadcasts.push(bcastPayload);
          admin.save();

          // Busca todos los usuarios pertenecientes a los grupos indicados
          User.find({ group: { $in: groups } }, (err, users) => {
            if (err) {
              return res.status(500).json({ status: 'Error', message: 'Error interno del servidor al obtener usuarios' });
            }

            // Envia la difusion a los usuarios
            let usernames = users.map(user => user.username);
            broadcastToUsers(usernames, bcastPayload);
          });

          res.status(201).json({ status: 'OK', message: 'Imagen difundida exitosamente' });
        });
      }
    ).end(req.file.buffer);
  });

// Envia la difusion a todos los usuarios indicados
function broadcastToUsers(usernames, payload) {
  usernames.forEach(username => {
    appendBroadcastToUser(username, payload);
  });
}

// Agrega la nueva difusion al usuario indicado
function appendBroadcastToUser(username, payload) {
  ref.child(username).once('value', function (snap) {
    let obj = {}
    let nextIndex = snap.numChildren() + 1
    obj[nextIndex] = {
      title: payload.title,
      description: payload.description,
      url: payload.imageUrl,
      read: false,
      timestamp: payload.timestamp,
    }
    ref.child(username).update(obj)
  });
}

module.exports = router;