let nodemailer = require('nodemailer');

const defaultEmailData = {from: 'iv.xromov@mail.ru'};

const sendEmail = (emailData) => {

    return new Promise((resolve, reject) => {
        nodemailer.createTestAccount((err, account) => {
            // create reusable transporter object using the default SMTP transport
            let transporter = nodemailer.createTransport({
                host: 'smtp.ethereal.email',
                port: 587,
                secure: false, // true for 465, false for other ports
                auth: {
                    user: account.user, // generated ethereal user
                    pass: account.pass  // generated ethereal password
                }
            });

            // Message object
            let message = Object.assign(defaultEmailData, emailData);

            console.log('Sending Mail');
            transporter.sendMail(message, function(error, info){
                if(error){
                    console.log('Error occured');
                    console.log(error.message);
                    resolve(false);
                }
                console.log('Message sent successfully!');
                console.log('Preview URL: ' + nodemailer.getTestMessageUrl(info));


                // if you don't want to use this transport object anymore, uncomment
                transporter.close(); // close the connection pool
                resolve(true);
            });
        });
    });




    // let transport = nodemailer.createTransport({
    //     direct: true,
    //     host: 'smtp.mail.ru',
    //     port: 465,
    //     auth: {
    //         user: "iv.xromov@mail.ru",
    //         pass: ""
    //     }
    // });
    //
    // // Message object
    // let message = Object.assign(defaultEmailData, emailData);
    // console.log('Sending Mail');
    // return new Promise((resolve, reject) => {
    //     transport.sendMail(message, function(error){
    //         if(error){
    //             console.log('Error occured');
    //             console.log(error.message);
    //             resolve(false);
    //         }
    //         console.log('Message sent successfully!');
    //
    //
    //         // if you don't want to use this transport object anymore, uncomment
    //         transport.close(); // close the connection pool
    //         resolve(true);
    //     });
    // })
};

module.exports = sendEmail;

