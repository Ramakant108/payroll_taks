const db = require("../models");
const { AuthenticationError } = require("../utils/customError");
const jwt = require("jsonwebtoken")


async function authentication(req,res, next){
    const token = req.headers["authorization"]?.split(" ")[1] || null;

    if(!token){
        throw new AuthenticationError("token not found");
    };

    const payload = jwt.verify(token,process.env.TOKEN_SECRETE);

    const user = await db.user.findOne({
        where:{
            id:payload.userId,
            deleted:false
        }
    })

    if(!user){
        throw new AuthenticationError("invalid user")
    }

    req.userId=user.id;
    req.roleId=user.role_id;
    next()
}

module.exports = authentication