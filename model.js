var Sequelize = require('sequelize');

module.exports = function (sequelize) {
    var User = sequelize.define("User", {
        email: Sequelize.STRING,
        firstName: Sequelize.STRING,
        lastName: Sequelize.STRING,
        phone: Sequelize.STRING,
        password: Sequelize.STRING,
        resetString: Sequelize.STRING
    });
    return {
        User: User
    };
};