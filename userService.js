var jwt=require('jsonwebtoken');

let secret = 'samplesecret';

let checkToken = (req, res) => {
    var token = req.body.token || req.query.token || req.headers['x-access-token'];

    return new Promise((resolve, reject) => {
        if(token){
            //Decode the token
            jwt.verify(token,secret,(err,decod)=>{
                console.log(decod);
                if(err){
                    resolve(false)
                }
                else{
                    //If decoded then call next() so that respective route is called.
                    req.decoded=decod;
                    resolve(true)
                }
            });
        }
        else{
            resolve(false)
        }
    })


}

module.exports = function (sequelize) {
    var model = require("./model")(sequelize);
    var User = model.User;
    return {
        register: function (req, res) {
            var newUser = {
                username: req.body.username,
                password: req.body.password
            };
            User.create(newUser).then((user) => {
                user = user.get({plain: true});
                var token = jwt.sign(user, secret);
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
                            var token = jwt.sign(user, secret);
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

        }
    };
};