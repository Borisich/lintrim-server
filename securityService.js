let jwt=require('jsonwebtoken');

let secret = 'samplesecret';
let tokenDuration = 60; //60 сек

let SecurityService = {};

SecurityService.checkToken = (req, res) => {
    let token = req.body.token || req.query.token || req.headers['x-access-token'];

    return new Promise((resolve, reject) => {
        if(token){
            jwt.verify(token, secret, (err, decod)=>{
                if(err){
                    resolve(false)
                }
                else{
                    req.decoded=decod;
                    resolve(true)
                }
            });
        }
        else{
            resolve(false)
        }
    })
};

// SecurityService.getTokenInfo = (req, res) => {
//     let token = req.body.token || req.query.token || req.headers['x-access-token'];
//
//     return new Promise((resolve, reject) => {
//         if(token){
//             jwt.verify(token, secret, (err, decod)=>{
//                 if(err){
//                     resolve(false)
//                 }
//                 else{
//                     req.decoded=decod;
//                     resolve(true)
//                 }
//             });
//         }
//         else{
//             resolve(false)
//         }
//     })
// };

SecurityService.signToken = (payload) => {
    delete payload.password;
    delete payload.resetString;
    delete payload.createdAt;
    delete payload.updatedAt;
    let extendedPayload = Object.assign({}, payload, {exp: Math.floor(Date.now() / 1000) + tokenDuration, durationSec: tokenDuration});
    return jwt.sign(extendedPayload, secret);
};

SecurityService.updateToken = (sequelize, req, res) => {
    console.log('update request');
    SecurityService.checkToken(req,res).then(ok => {
        if (ok) {
            //обновим payload для токена
            let model = require("./model")(sequelize);
            let User = model.User;
            User.findOne({where: {id: req.decoded.id}}).then(user => {
                let newToken = SecurityService.signToken(user.get({plain: true}));
                res.status(200).json({
                    ok: true,
                    token: newToken
                });
            })
        } else {
            res.status(403).json({
                ok: false,
            });
        }
    })
};

module.exports = SecurityService;