let nodemailer = require('nodemailer');

const defaultEmailData = {from: 'iv.xromov@mail.ru'};

const sendEmail = (emailData) => {
    // Create a SMTP transport object
    let transport = nodemailer.createTransport({
        direct: true,
        host: 'smtp.mail.ru',
        port: 465,
        auth: {
            user: "iv.xromov@mail.ru",
            pass: ""
        }
    });

// Message object
    let message = Object.assign(defaultEmailData, emailData);
//     let message = {
//
//         // sender info
//         from: 'iv.xromov@mail.ru',
//
//         // Comma separated list of recipients
//         to: 'iv.xromov@mail.ru',
//
//         // Subject of the message
//         subject: 'Восстановление пароля', //'Nodemailer is unicode friendly ✔',
//
//         // plaintext body
//         text: 'Hello world' //'Hello to myself!',
//
//         // HTML body
//         /*  html:'<p><b>Hello</b> to myself <img src="cid:note@node"/></p>'+
//            '<p>Here\'s a nyan cat for you as an embedded attachment:<br/></p>'*/
//     };

    console.log('Sending Mail');
    return new Promise((resolve, reject) => {
        transport.sendMail(message, function(error){
            if(error){
                console.log('Error occured');
                console.log(error.message);
                resolve(false);
            }
            console.log('Message sent successfully!');


            // if you don't want to use this transport object anymore, uncomment
            transport.close(); // close the connection pool
            resolve(true);
        });
    })
};

module.exports = sendEmail;

