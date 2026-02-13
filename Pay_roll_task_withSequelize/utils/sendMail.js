
const transport = require('../config/mailConnection');

async function sendMail(from, to ,subject, body){
    await transport.sendMail({
        from,
        to,
        subject,
        text:body
    })
    console.log("mail send")
}

module.exports = sendMail