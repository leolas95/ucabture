const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
    name: String,
    lastname: String,
    username: String,
    password: String,
    email: String,
});

// Cual va a ser la "clave primaria"? username o email
UserSchema.statics.authenticate = function (username, password, callback) {
    User.findOne({ username: username })
        .exec(function (err, user) {
            if (err) {
                return callback(err);
            } else if (!user) {
                const err = new Error('User not found!');
                console.log(`Usuario ${username} no encontrado`);
                err.status = 401;
                return callback(err);
            }

            if (user.password === password) {
                console.log(`Usuario ${username} encontrado: ${user.name}`);
                return callback(null, user);
            } else {
                console.log(`Clave incorrecta para ${username}`);
                return callback();
            }
        });
};

UserSchema.methods.isValidPassword = function (password) {
    return bcrypt.compareSync(password, this.password, function (err, res) {
        console.log('res', res);
        return res === true;
    });
}

const User = mongoose.model('User', UserSchema);
module.exports = User;