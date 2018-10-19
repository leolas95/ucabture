const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/expresateucabdb', { useNewUrlParser: true });
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'Connection error:'));
db.once('open', function() {
    console.log('Conectado a la base de datos');
});

module.exports = db;