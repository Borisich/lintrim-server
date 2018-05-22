let sendEmail = require("./emailer");

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
        recover: function (req, res) {
            console.log('recover');
            let email = req.body.email;

            if (!email) {
                res.status(403).json({
                    ok: false,
                    message: 'no email in request'
                });
            }

            function randomStr(length) {
                let text = "";
                let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

                for (let i = 0; i < length; i++)
                    text += possible.charAt(Math.floor(Math.random() * possible.length));

                return text;
            }

            const token = randomStr(80);

            let data = {
                to: 'iv.xromov@mail.ru',
                subject: 'Восстановление пароля', //'Nodemailer is unicode friendly ✔',
                text: `Для восстановления пароля перейдите по ссылке: ${'http://localhost:3000/login/reset/'}${token}`, //'Hello to myself!',
                html: `<p>Для восстановления пароля перейдите по ссылке: </p><p>${'http://localhost:3000/login/reset/'}${token}</p>`,
            };

            User.findOne({where: {username: email}}).then(user => {
                if (!user){
                    res.status(403).json({
                        ok: false,
                        message: 'no user found'
                    });
                } else {
                    User.update({resetString: token}, {where: {username: email}}).then(result => {
                        sendEmail(data).then(ok => {
                            if (ok) {
                                console.log('COMPLETE')
                                res.status(200).json({
                                    ok: true,
                                });
                            } else {
                                res.status(403).json({
                                    ok: false,
                                    message: 'failed to send mail'
                                });
                            }
                        })
                    })
                }
            })
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