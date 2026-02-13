const { validationResult } = require("express-validator")
const { ValidationError, BusinessError } = require("../utils/customError.js");
const bcrypt = require('bcryptjs');
const generateAccessToken = require("../utils/generateAccessToken.js");
const Responce = require("../utils/responce.js");
const sendMail = require("../utils/sendMail.js");
const genrateOTP = require("../utils/generateOTP.js");
const pool = require("../config/pgPool");

async function userRegister(req, res) {
    const result = validationResult(req);
    if (!result.isEmpty()) {
        throw new ValidationError(result.errors[0].msg);
    }

    const { lname, fname, email, password, roleName } = req.body;

    const existingUserResult = await pool.query(
        `SELECT * FROM users WHERE email = $1 AND deleted = false`,
        [email]
    );

    if (existingUserResult.rowCount > 0) {
        throw new BusinessError("User allready present")
    }

    const roleResult = await pool.query(
        `SELECT * FROM roles WHERE name = $1 AND deleted = false LIMIT 1`,
        [roleName]
    );

    if (roleResult.rowCount === 0) {
        throw new BusinessError("Role not found");
    }

    const role = roleResult.rows[0];
    const hashPassword = await bcrypt.hash(password, 10);
    const newUserResult = await pool.query(
        `INSERT INTO users (lname, fname, email, password, role_id)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [lname, fname, email, hashPassword, role.id]
    );

    const newUser = newUserResult.rows[0];
    const token = generateAccessToken({ userId: newUser.id, roleId: role.id })
    const data = Responce.created("user created successfuly", { token, data: newUser })
    res.status(200).json(data)
}

async function login(req, res) {
    const error = validationResult(req);
    if (!error.isEmpty()) {
        throw new ValidationError(error.errors[0].msg);
    }
    const { email, password } = req.body

    const userResult = await pool.query(
        `SELECT * FROM users WHERE email = $1 AND deleted = false`,
        [email]
    );

    if (userResult.rowCount === 0) {
        throw new BusinessError("user not present with this email id")
    }

    const user = userResult.rows[0];
    console.log(password, user.password)
    const isCorrect = await bcrypt.compare(password, user.password);
    if (!isCorrect) {
        throw new BusinessError("Incorrect password")
    }

    const token = generateAccessToken({ userId: user.id, roleId: user.role_id });

    const data = Responce.ok("login successfuly", { token, data: user })
    res.status(200).json(data)
}


async function sendOTP(req,res){
    const error= validationResult(req);
    if(!error.isEmpty()){
       throw new ValidationError(error.errors[0].msg)
    }
    const { email } = req.body;

    const userResult = await pool.query(
        `SELECT * FROM users WHERE email = $1 AND deleted = false`,
        [email]
    );

    if (userResult.rowCount === 0) {
        throw new BusinessError("user not present with this email id")
    }

    const user = userResult.rows[0];

    const otp = genrateOTP();
    const expire_time = new Date(Date.now() + 30 * 1000);

    await pool.query(
        `INSERT INTO user_otp ("userId", otp, expire_time)
         VALUES ($1, $2, $3)`,
        [user.id, otp, expire_time]
    );


    const mailBody =`Use This OTP for reset password ${otp}`

    sendMail(process.env.EMAIL_USER,email,"Password Reset OTP",mailBody);

    const data = Responce.ok("otp sent",{otp})
    res.status(200).json(data)
}


async function resetPassword(req,res){
    const error = validationResult(req);
    if(!error.isEmpty()){
        throw new ValidationError(error.errors[0].msg);
    }
    
    const { email, newPassword, otp } = req.body;

    const userWithOtpResult = await pool.query(
        `SELECT u.*, o.id as otp_id
         FROM users u
         LEFT JOIN user_otp o
           ON o."userId" = u.id
          AND o.otp = $2
          AND o.deleted = false
          AND o.expire_time > NOW()
         WHERE u.email = $1
           AND u.deleted = false`,
        [email, otp]
    );

    if (userWithOtpResult.rowCount === 0) {
        throw new BusinessError("user not present with this email id")
    }

    const userRow = userWithOtpResult.rows[0];

    if (!userRow.otp_id) {
        throw new BusinessError("otp not found")
    }

    const newhashPass = await bcrypt.hash(newPassword, 10);
    const updatePass = await pool.query(
        `UPDATE users
         SET password = $1
         WHERE email = $2
           AND deleted = false`,
        [newhashPass, email]
    );

    if (updatePass.rowCount === 0) {
       throw new BusinessError("password not updated please try again")
    }

    const result= Responce.ok("password reset successfuly",null);
    res.status(200).json(result)
}

module.exports = { userRegister, login, sendOTP,resetPassword }