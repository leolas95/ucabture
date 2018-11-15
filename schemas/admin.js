const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const AdminSchema = new mongoose.Schema({
    name: String,
    lastname: String,
    username: String,
    password: String,
    email: String,
    broadcasts: Array,
});

AdminSchema.methods.isValidPassword = function (password) {
    return bcrypt.compareSync(password, this.password, function (err, res) {
        return res === true;
    });
};

const Admin = mongoose.model('Admin', AdminSchema);
module.exports = Admin;