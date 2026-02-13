const { AuthenticationError } = require("../utils/customError");
const jwt = require("jsonwebtoken")
const pool = require("../config/pgPool");


async function authentication(req,res, next){
    const token = req.headers["authorization"]?.split(" ")[1] || null;

    if(!token){
        throw new AuthenticationError("token not found");
    };

    const payload = jwt.verify(token,process.env.TOKEN_SECRETE);

    const userResult = await pool.query(
        `SELECT * FROM users WHERE id = $1 AND deleted = false`,
        [payload.userId]
    );

    if(userResult.rowCount === 0){
        throw new AuthenticationError("invalid user")
    }

    const user = userResult.rows[0];

    req.userId=user.id;
    req.roleId=user.role_id;
    next()
}

module.exports = authentication