const jwt = require('jsonwebtoken')


function generateAccessToken(payload){
    return jwt.sign(payload,process.env.TOKEN_SECRETE,{
        expiresIn:"1d"
    })
}

module.exports = generateAccessToken