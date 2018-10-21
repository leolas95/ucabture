const express = require('express');
const app = express();
const db = require('./db/db');
const router = require('./routes/router');
const passport = require('passport');


app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

app.use('/', router);

const PORT = process.env.PORT || 3000
app.listen(PORT, function () {
    console.log(`Server listening on port ${PORT}`);
});