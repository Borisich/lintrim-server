let sendEmail = require("./emailer");

let checkToken = require("./securityService").checkToken;
let signToken = require("./securityService").signToken;
//import utils from './utils';
let utils = require("./utils");

module.exports = function (sequelize) {
    let model = require("./model")(sequelize);
    let User = model.User;
    return {
        register: function (req, res) {
            let newUser = {
                email: req.body.email,
                password: req.body.password
            };

            User.create(newUser).then((user) => {
                let onError = (user) => {
                    //В любой непонятной ситуации удаляй юзера!
                    user.destroy({force: true})
                };

                let userPlain = user.get({plain: true});

                const token = utils.getUniqueString();
                let link = `${req.body.emailURL}${token}`;
                let data = {
                    to: 'iv.xromov@mail.ru',
                    subject: 'Активация аккаунта', //'Nodemailer is unicode friendly ✔',
                    text: `Для активации аккаунта перейдите по ссылке: ` + link, //'Hello to myself!',
                    html: `<p>Для активации аккаунта перейдите по ссылке: </p><p><a href=${link}>link</a></p>`,
                };

                User.update({uniqueString: token}, {where: {id: userPlain.id}}).then(result => {
                    sendEmail(data).then(ok => {
                        if (ok) {
                            console.log('Reg Successful');
                            let message = "Reg Successful";
                            res.send({
                                ok: true,
                                message,
                            });
                        } else {
                            onError(user);
                            res.status(403).json({
                                ok: false,
                                message: 'failed to send mail'
                            });
                        }
                    })
                }).catch(error => {
                    onError(user);
                    res.status(403).json({
                        ok: false,
                        message: "Update user error"
                    });
                });
            });
        },
        confirmEmail: function (req, res) {
            let message;
            User.findOne({where: {uniqueString: req.body.confirmString}}).then((user) => {
                if (user) {
                    user = user.get({plain: true});
                    let updatedUser = {
                        uniqueString: null
                    };

                    User.update(updatedUser, {where: {uniqueString: req.body.confirmString}}).then(result => {
                        //create the token.
                        let token = signToken(user);
                        message = "Login Successful";
                        res.status(200).json({
                            ok: true,
                            message,
                            token
                        });
                    }).catch(error => {
                        message = "Update user error";
                        res.status(403).json({
                            ok: false,
                            message
                        });
                    })
                } else {
                    message = "Wrong confirmString value";
                    res.status(403).json({
                        ok: false,
                        message
                    });
                }
            });
        },
        login: function (req, res) {
            let message;
            User.findOne({where: {email: req.body.email}}).then((user) => {
                if (user){
                    user = user.get({plain: true});

                    if (user.uniqueString) {
                        message = "Account is not confirmed or password reset in progress";
                        res.status(403).json({
                            ok: false,
                            message
                        });
                    } else {
                        if (user.password === req.body.password) {
                            let token = signToken(user);
                            message = "Login Successful";
                            res.status(200).json({
                                ok: true,
                                message,
                                token
                            });
                        } else {
                            message = "Wrong Password";
                            res.status(403).json({
                                ok: false,
                                message
                            });
                        }
                    }
                } else {
                    message = "User not found";
                    res.status(403).json({
                        ok: false,
                        message
                    });
                }
            });
        },
        resetPassword: function (req, res) {
            let message;
            User.findOne({where: {uniqueString: req.body.resetString}}).then((user) => {
                if (user) {
                    user = user.get({plain: true});
                    let updatedUser = {
                        password: req.body.password,
                        uniqueString: null
                    };

                    User.update(updatedUser, {where: {uniqueString: req.body.resetString}}).then(result => {
                        //create the token.
                        var token = signToken(user);
                        message = "Login Successful";
                        res.status(200).json({
                            ok: true,
                            message,
                            token
                        });
                    }).catch(error => {
                        message = "Update user error";
                        res.status(403).json({
                            ok: false,
                            message
                        });
                    })
                } else {
                    message = "Wrong resetString value";
                    res.status(403).json({
                        ok: false,
                        message
                    });
                }
            });
        },
        updatePassword: function (req, res) {
            checkToken(req,res).then(ok => {
                let message;
                if (ok) {
                    let userId = req.decoded.id; //id пользователя из расшифрованного токена
                    let oldPassword = req.body.oldPassword;
                    let newPassword = req.body.newPassword;

                    User.findOne({where: {id: userId}}).then((user) => {
                        if (user) {
                            user = user.get({plain: true});
                            let updatedUser = {
                                password: newPassword
                            };

                            if (oldPassword === user.password) {
                                User.update(updatedUser, {where: {id: userId}}).then(result => {
                                    message = "Update Successful";
                                    res.status(200).json({
                                        ok: true,
                                        message,
                                    });
                                }).catch(error => {
                                    message = "Update Error";
                                    res.status(403).json({
                                        ok: false,
                                        message
                                    });
                                })
                            } else {
                                message = "Wrong Password";
                                res.status(403).json({
                                    ok: false,
                                    message
                                });
                            }

                        } else {
                            message = "User not found";
                            res.status(403).json({
                                ok: false,
                                message
                            });
                        }
                    }).catch(error => {
                        message = "DB Access Error";
                        res.status(403).json({
                            ok: false,
                            message
                        });
                    });
                } else {
                    message = "Wrong token";
                    res.status(403).json({
                        ok: false,
                        message
                    });
                }
            })
        },
        recoverPassword: function (req, res) {
            console.log('recover');
            let email = req.body.email;

            if (!email) {
                res.status(403).json({
                    ok: false,
                    message: 'no email in request'
                });
            }

            const token = utils.getUniqueString();
            let link = `${req.body.emailURL}${token}`;//`${'http://localhost:3000/login/reset/'}${token}`;
            let data = {
                to: 'iv.xromov@mail.ru',
                subject: 'Восстановление пароля', //'Nodemailer is unicode friendly ✔',
                text: `Для восстановления пароля перейдите по ссылке: ` + link, //'Hello to myself!',
                html: `<p>Для восстановления пароля перейдите по ссылке: </p><p><a href=${link}>link</a></p>`,
            };

            User.findOne({where: {email: email}}).then(user => {
                if (!user){
                    res.status(403).json({
                        ok: false,
                        message: 'no user found'
                    });
                } else {
                    User.update({uniqueString: token}, {where: {email: email}}).then(result => {
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
                    }).catch(error => {
                        res.status(403).json({
                            ok: false,
                            message: "Update user error"
                        });
                    })
                }
            })
        },
        updateProfile: function (req, res) {
            checkToken(req,res).then(ok => {
                let message;
                if (ok) {
                    let userId = req.decoded.id; //id пользователя из расшифрованного токена
                    let updatedUser = req.body.profile;

                    User.update(updatedUser, {where: {id: userId}}).then(result => {
                        message = "Update Successful";
                        res.status(200).json({
                            ok: true,
                            message,
                        });
                    }).catch(error => {
                        message = "Update Error";
                        res.status(403).json({
                            ok: false,
                            message
                        });
                    })
                } else {
                    message = "Wrong token";
                    res.status(403).json({
                        ok: false,
                        message
                    });
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