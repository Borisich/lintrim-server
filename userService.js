
let checkToken = require("./securityService").checkToken;
let signToken = require("./securityService").signToken;

module.exports = function (sequelize) {
    let model = require("./model")(sequelize);
    let User = model.User;
    return {
        register: function (req, res) {
            let newUser = {
                username: req.body.username,
                password: req.body.password
            };
            User.create(newUser).then((user) => {
                user = user.get({plain: true});
                let token = signToken(user);
                let message = "Reg Successful";
                res.send({
                    ok: true,
                    message,
                    token
                });
            });
        },
        login: function (req, res) {
            let message;
            User.findAll().then((users) => {
                for(var user of users) {
                    user = user.get({plain: true});
                    if (user.username != req.body.username) {
                        message = "Wrong Name";
                    } else {
                        if (user.password != req.body.password) {
                            message = "Wrong Password";
                            break;
                        }
                        else {
                            //create the token.
                            var token = signToken(user);
                            message = "Login Successful";
                            break;
                        }
                    }
                }
                //If token is present pass the token to client else send respective message
                if(token){
                    res.status(200).json({
                        ok: true,
                        message,
                        token
                    });
                }
                else{
                    res.status(403).json({
                        ok: false,
                        message
                    });
                }
            });

        },
        get: function (req, res) {
            checkToken(req,res).then(ok => {
                if (ok) {
                    User.findAll().then((users) => {
                        res.send(users);
                    });
                } else {
                    res.status(403).json({
                        ok: false,
                    });
                }
            })
        },
    };
};