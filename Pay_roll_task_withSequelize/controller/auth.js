const { validationResult } = require("express-validator")
const { ValidationError, BusinessError } = require("../utils/customError.js");
const db = require("../models/index.js");
const bcrypt = require('bcryptjs');
const generateAccessToken = require("../utils/generateAccessToken.js");
const Responce = require("../utils/responce.js");
const sendMail = require("../utils/sendMail.js");
const genrateOTP = require("../utils/generateOTP.js");
const { Op } = require("sequelize");


async function userRegister(req, res) {
    const result = validationResult(req);
    if (!result.isEmpty()) {
        throw new ValidationError(result.errors[0].msg);
    }

    const { lname, fname, email, password,roleName } = req.body;

    const user = await db.user.findOne({
        where: {
            email,
            deleted: false
        }
    })

    if (user) {
        throw new BusinessError("User allready present")
    }
    const role = await db.role.findOne({
        where: {
            name: roleName,
            deleted: false
        }
    })
    const hashPassword = await bcrypt.hash(password, 10);
    const newUser = await db.user.create({ lname, fname, email, password: hashPassword, role_id: role.id })
    if (!newUser) {
        throw new BusinessError("User not created")
    }
    const token = generateAccessToken({ userId: newUser.id, roleId:role.id })
    const data = Responce.created("user created successfuly", { token, data: newUser })
    res.status(200).json(data)
}

async function login(req, res) {
    const error = validationResult(req);
    if (!error.isEmpty()) {
        throw new ValidationError(error.errors[0].msg);
    }
    const { email, password } = req.body
    const user = await db.user.findOne({
        where: {
            email,
            deleted:false
        }
    })
    if (!user) {
        throw new BusinessError("user not present with this email id")
    }
    console.log(password,user.password)
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
    const {email} = req.body;
    const user = await db.user.findOne({
        where: {
            email,
            deleted:false
        }
    })
    if (!user) {
        throw new BusinessError("user not present with this email id")
    }

    const otp = genrateOTP();
    const expire_time=new Date(Date.now() + 30 * 1000);

    db.userOtp.create({userId:user.id,otp,expire_time})


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
    
    const {email,newPassword,otp} = req.body;
    
    const user = await db.user.findOne({
        where: {
            email,
            deleted:false
        },
        include:[{
            model:db.userOtp,
            where:{
                otp,
                deleted:false,
                expire_time:{[Op.gt]:new Date()}
            },
            required:false
        }]
    })
    if (!user) {
        throw new BusinessError("user not present with this email id")
    }
    if(!user.userOtp){
        throw new BusinessError("otp not found")
    }

    const newhashPass = await bcrypt.hash(newPassword,10);
    const updatePass = await db.user.update({password:newhashPass},{
         where: {
            email,
            deleted:false
        }
    })
    if(!updatePass[0]){
       throw new BusinessError("password not updated please try again")
    }

    const result= Responce.ok("password reset successfuly",null);
    res.status(200).json(result)
}

module.exports = { userRegister, login, sendOTP,resetPassword }