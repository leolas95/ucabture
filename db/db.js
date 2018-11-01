const mongoose = require('mongoose');

// Se conecta a la base de datos dependiendo del entorno en el que estemos
if (process.env.NODE_ENV === 'production') {
    // produccion
    mongoose.connect(`mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@ds135750.mlab.com:35750/${process.env.DB_PRODDB}`, { useNewUrlParser: true });
} else if (process.env.NODE_ENV === 'dev') {
    // desarrollo
    mongoose.connect(`mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DEVDB}`, { useNewUrlParser: true });
} else if (process.env.NODE_ENV === 'test') {
    // test
    mongoose.connect(`mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_TESTDB}`, { useNewUrlParser: true });
}
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'Connection error:'));
db.once('open', function() {
    console.log('Conectado a la base de datos');
});

module.exports = db;