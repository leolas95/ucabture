if (process.env.NODE_ENV !== 'production') {
    require('dotenv').load();
}

const express = require('express');
const app = express();
const db = require('./db/db');
const users = require('./routes/users');
const admins = require('./routes/admins');
const passport = require('passport');

app.use('/images', express.static('images'));
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

app.use('/', users);
app.use('/admins', admins);

const PORT = process.env.PORT || 3000
app.listen(PORT, function () {
    console.log(`Server listening on port ${PORT}`);
});