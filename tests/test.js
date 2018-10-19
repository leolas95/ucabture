const expect = require('chai').expect;
const User = require('../schemas/user');


describe('User', function() {
    it('should have authenticate function', function() {
        expect(User.authenticate).to.be.a('function');
    });
});