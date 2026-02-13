const express = require('express');
const { register, loginValidation, sendOtp, resetPasswordValidation } = require('../utils/validation');
const errorHandler = require('../utils/errorHandler');
const { userRegister, login, sendOTP, resetPassword } = require('../controller/auth');
const authentication = require('../middleware/auth');


const route=express.Router()

route.get('/auth/',authentication)

route.post('/auth/register',register,errorHandler(userRegister));
route.get('/auth/login',loginValidation,errorHandler(login));
route.get('/auth/sendotp',sendOtp,errorHandler(sendOTP));
route.put('/auth/resetPass',resetPasswordValidation,errorHandler(resetPassword))

module.exports = route;