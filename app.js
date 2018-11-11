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
const admin = require('firebase-admin');
const serviceAccount = require('./ucabture-private-key.json');

app.use('/images', express.static('images'));
app.use('/bcastimages', express.static('bcastimages'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

// Configura el middleware para cors. Aceptamos cualquier origen
app.use(cors());
app.use('/', users);
app.use('/admins', admins);

/*let users2 = ['user1', 'user2', 'user3']
broadcastToUsers(users2);

function appendBroadcastToUser(username) {
    ref.child(username).once('value', function(snap) {
        let obj = {}
        let nextIndex = snap.numChildren() + 1
        obj[nextIndex] = { url: 'www.google.com.ve', read: false, timestamp: 123123123 };
        ref.child(username).update(obj)
    });
}

function broadcastToUsers(users2) {
    for (let i = 0; i < users2.length; i++) {
        let username = users2[i];
        appendBroadcastToUser(username);
    }
}*/

const PORT = process.env.PORT || 3000
app.listen(PORT, function () {
    console.log(`Server listening on port ${PORT}`);
});
