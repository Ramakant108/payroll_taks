const express = require('express');
const { register, loginValidation, sendOtp, resetPasswordValidation } = require('../utils/validation');
const errorWrapper = require('../utils/errorWrapper');
const { userRegister, login, logout, sendOTP, resetPassword } = require('../controller/auth');
const authentication = require('../middleware/auth');

const route = express.Router();

route.get('/auth/', authentication);

route.post('/auth/register', register, errorWrapper(userRegister));
route.get('/auth/login', loginValidation, errorWrapper(login));
route.post('/auth/logout', authentication, errorWrapper(logout));
route.get('/auth/sendotp', sendOtp, errorWrapper(sendOTP));
route.put('/auth/resetpass', resetPasswordValidation, errorWrapper(resetPassword));

module.exports = route;