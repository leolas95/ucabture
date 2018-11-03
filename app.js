if (process.env.NODE_ENV !== 'production') {
    require('dotenv').load();
}

const express = require('express');
const app = express();
const db = require('./db/db');
const users = require('./routes/users');
const admins = require('./routes/admins');
const passport = require('passport');
const cors = require('cors');

app.use('/images', express.static('images'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

// Configura el middleware para cors. Aceptamos cualquier origen
app.use(cors());
app.use('/', users);
app.use('/admins', admins);

const PORT = process.env.PORT || 3000
app.listen(PORT, function () {
    console.log(`Server listening on port ${PORT}`);
});
