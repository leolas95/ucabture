const express = require('express');
const router = express.Router();
const Admin = require('../schemas/admin');
const bcrypt = require('bcrypt');
const saltRounds = 5;

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


module.exports = router;