const db = require('../models');
const { AuthenticationError } = require('../utils/customError');
const jwt = require('jsonwebtoken');
const { createRedisClient } = require('../config/redisConnection');

async function authentication(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1] || null;

  if (!token) {
    throw new AuthenticationError('token not found');
  }

  let payload;
  try {
    payload = jwt.verify(token, process.env.TOKEN_SECRETE);
  } catch (err) {
    throw new AuthenticationError('invalid token');
  }

  // check token in redis (blacklist / active list)
  try {
    const redis = await createRedisClient();
    const key = `auth:token:${payload.userId}:${token}`;
    const stored = await redis.get(key);

    if (!stored) {
      // token either never stored or logged out
      throw new AuthenticationError('session expired, please login again');
    }
  } catch (err) {
    // on redis failure, fallback to DB-only auth (do not break API)
    if (err instanceof AuthenticationError) {
      throw err;
    }
    console.error('Redis auth check error', err);
  }

  const user = await db.user.findOne({
    where: {
      id: payload.userId,
      deleted: false,
    },
  });

  if (!user) {
    throw new AuthenticationError('invalid user');
  }

  req.userId = user.id;
  req.roleId = user.role_id;
  next();
}

module.exports = authentication;