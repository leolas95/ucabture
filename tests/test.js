const expect = require('chai').expect;
const User = require('../schemas/user');
const bcrypt = require('bcrypt');

describe('User', function () {

    it('should have authenticate method', function () {
        expect(User.authenticate).to.be.a('function');
    });

    it('should have isValidPassword method', function () {
        expect(User.schema.methods['isValidPassword']).to.be.a('function');
    });
});
