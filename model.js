var Sequelize = require('sequelize');

module.exports = function (sequelize) {
    var User = sequelize.define("User", {
        email: Sequelize.STRING,
        firstName: Sequelize.STRING,
        lastName: Sequelize.STRING,
        phone: Sequelize.STRING,
        password: Sequelize.STRING,
        uniqueString: Sequelize.STRING //для подверждения email и сброса пароля
    });
    return {
        User: User
    };
};