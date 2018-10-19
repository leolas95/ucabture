const express = require('express');
const app = express();
const db = require('./db/db');
const router = require('./routes/router');


app.use(express.urlencoded({ extended: true }));

app.use('/', router);

const PORT = process.env.PORT || 3000
app.listen(PORT, function () {
    console.log(`Server listening on port ${PORT}`);
});