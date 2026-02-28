const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');

const { ValidationError, BusinessError } = require('../utils/customError.js');
const db = require('../models/index.js');
const generateAccessToken = require('../utils/generateAccessToken.js');
const sendMail = require('../utils/sendMail.js');
const genrateOTP = require('../utils/generateOTP.js');
const { createRedisClient } = require('../config/redisConnection');

async function userRegister(req) {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    throw new ValidationError(result.errors[0].msg);
  }

  const { lname, fname, email, password, roleName } = req.body;

  const user = await db.user.findOne({
    where: {
      email,
      deleted: false,
    },
  });

  if (user) {
    throw new BusinessError('User allready present');
  }

  const role = await db.role.findOne({
    where: {
      name: roleName,
      deleted: false,
    },
  });
if (!role) {
    throw new BusinessError('role not found');
  }
  const hashPassword = await bcrypt.hash(password, 10);
  const newUser = await db.user.create({
    lname,
    fname,
    email,
    password: hashPassword,
    role_id: role.id,
  });

  if (!newUser) {
    throw new BusinessError('User not created');
  }

  const token = generateAccessToken({ userId: newUser.id, roleId: role.id });

  try {
    const redis = await createRedisClient();
    const key = `auth:token:${newUser.id}:${token}`;
    await redis.set(key, 'active', { EX: 24 * 60 * 60 });
  } catch (err) {
    console.error('Redis store token (register) error', err);
  }

  return { message: 'user created successfuly', data: { token, data: newUser } };
}

async function login(req) {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    throw new ValidationError(error.errors[0].msg);
  }

  const { email, password } = req.body;
  const user = await db.user.findOne({
    where: {
      email,
      deleted: false,
    },
  });

  if (!user) {
    throw new BusinessError('user not present with this email id');
  }

  const isCorrect = await bcrypt.compare(password, user.password);
  if (!isCorrect) {
    throw new BusinessError('Incorrect password');
  }

  const token = generateAccessToken({ userId: user.id, roleId: user.role_id });

  try {
    const redis = await createRedisClient();
    const key = `auth:token:${user.id}:${token}`;
    await redis.set(key, 'active', { EX: 24 * 60 * 60 });
  } catch (err) {
    console.error('Redis store token (login) error', err);
  }

  return { message: 'login successfuly', data: { token, data: user } };
}

async function logout(req) {
  const token = req.headers['authorization']?.split(' ')[1] || null;

  if (!token || !req.userId) {
    throw new ValidationError('token not found');
  }

  try {
    const redis = await createRedisClient();
    const key = `auth:token:${req.userId}:${token}`;
    await redis.del(key);
  } catch (err) {
    console.error('Redis logout error', err);
  }

  return { message: 'logout successfuly', data: null };
}

async function sendOTP(req) {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    throw new ValidationError(error.errors[0].msg);
  }

  const { email } = req.body;
  const user = await db.user.findOne({
    where: {
      email,
      deleted: false,
    },
  });

  if (!user) {
    throw new BusinessError('user not present with this email id');
  }

  const otp = genrateOTP();
  const expire_time = new Date(Date.now() + 30 * 1000);

  await db.userOtp.create({ userId: user.id, otp, expire_time });

  const mailBody = `Use This OTP for reset password ${otp}`;
  sendMail(process.env.EMAIL_USER, email, 'Password Reset OTP', mailBody);

  return { message: 'otp sent', data: { otp } };
}

async function resetPassword(req) {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    throw new ValidationError(error.errors[0].msg);
  }

  const { email, newPassword, otp } = req.body;

  const user = await db.user.findOne({
    where: {
      email,
      deleted: false,
    },
    include: [
      {
        model: db.userOtp,
        where: {
          otp,
          deleted: false,
          expire_time: { [Op.gt]: new Date() },
        },
        required: false,
      },
    ],
  });

  if (!user) {
    throw new BusinessError('user not present with this email id');
  }

  if (!user.userOtp) {
    throw new BusinessError('otp not found');
  }

  const newhashPass = await bcrypt.hash(newPassword, 10);
  const updatePass = await db.user.update(
    { password: newhashPass },
    {
      where: {
        email,
        deleted: false,
      },
    },
  );

  if (!updatePass[0]) {
    throw new BusinessError('password not updated please try again');
  }

  return { message: 'password reset successfuly', data: null };
}

module.exports = { userRegister, login, sendOTP, resetPassword, logout };

