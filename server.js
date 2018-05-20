
// get dependencies
var express = require("express");
var Sequelize = require("sequelize");
var bodyParser = require("body-parser");
var app = express();

var jwt=require('jsonwebtoken');



app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,x-access-token');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

app.use(bodyParser());



// sequelize initialization
let sequelize = new Sequelize("mysql://root:root@localhost:3306/lintrim");
var userService= require("./userService")(sequelize);

//sync the model with the database
sequelize.sync().then((err) => {
    app.post("/register", userService.register);
    app.post("/login", userService.login);
    app.get("/users", userService.get);

    app.listen(5000);
});