const fs = require('fs');
const express = require('express');
const router = express.Router();
const Admin = require('../schemas/admin');
const User = require('../schemas/user');
const bcrypt = require('bcrypt');
const saltRounds = 5;
const multer = require('multer');
const url = require('url');
const admin = require('firebase-admin');
const serviceAccount = require('../ucabture-private-key.json');

//
// Configuracion para multer
//
const imagesDestination = 'bcastimages/';

// Si el directorio donde se guardaran las imagenes no existe, lo crea
if (!fs.existsSync(imagesDestination)) {
  fs.mkdirSync(imagesDestination);
}

// Configuracion de almacenamiento para multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, imagesDestination);
  },

  filename: function (req, file, cb) {
    // Formato del nombre de la imagen: username + fecha + nombre original
    const newFileName = `${req.body.username}-${new Date().toISOString()}-${file.originalname}`
    cb(null, newFileName);
  },
});

const upload = multer({ storage: storage });


//
// Configuracion de Firebase realtime database
//
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://ucabture-fff32.firebaseio.com"
});

const fdb = admin.database();
const ref = fdb.ref('/users');


// Endpoint para que un admin inicie sesion
router.post('/login', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Verifica que los campos no esten vacios
  if (!username || !password || !username.trim() || !password.trim()) {
    return res.status(400).json({ message: 'Campos de usuario o clave no pueden estar vacios' });
  }

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
  const name = req.body.name;
  const lastname = req.body.lastname;
  const username = req.body.username;
  const password = req.body.password;

  if (!name || !lastname || !username || !password ||
    !name.trim() || !lastname.trim() || !username.trim() || !password.trim()) {
    return res.status(400).json({ message: 'Los campos no pueden estar vacios' });
  }

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
router.post('/bcast', upload.single('image'), (req, res) => {
  console.log(req.body);

  Admin.findOne({ username: req.body.username }, (err, admin) => {
    if (err) {
      console.log('Error interno del servidor al guardar imagen');
      res
        .status(500)
        .json({ status: 'Error', message: 'Hubo un error en el servidor al guardar la imagen:' });
    }

    // Si el administrador no existe, elimina la imagen
    if (!admin) {
      console.log(`Admin ${req.body.username} no existe`);
      fs.unlink(req.file.path, (err) => {
        if (err) {
          throw err;
        }
      });

      return res
        .status(404)
        .json({ status: 'Error', message: 'El administrador indicado no existe' });
    }

    // Obtiene la url completa de donde poder descargar la imagen
    const fullUrl = url.format({
      protocol: req.protocol,
      host: req.get('host'),
      pathname: req.file.path,
    });

    // Construye el payload de la difusion
    const bcastPayload = {
      title: req.body.title,
      description: req.body.description,
      imageUrl: fullUrl,
    }
    const groups = req.body.groups.split(',');

    // Busca todos los usuarios pertenecientes a los grupos indicados
    User.find({ group: { $in: groups } }, (err, users) => {
      if (err) {
        throw err;
      }

      // Envia la difusion a los usuarios
      let usernames = users.map(user => user.username);
      broadcastToUsers(usernames, bcastPayload);
    });

    res.status(201).json({ status: 'OK', message: 'Imagen difundida exitosamente' });
  });
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
      timestamp: Date.now()
    }
    ref.child(username).update(obj)
  });
}

module.exports = router;