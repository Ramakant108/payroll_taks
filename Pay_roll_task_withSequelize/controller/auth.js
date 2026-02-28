const response = require('../utils/response');
const authService = require('../service/auth');

exports.userRegister = async (req, res) => {
  const result = await authService.userRegister(req);
  return response.created(res, result, { httpStatusCode: 200 });
};

exports.login = async (req, res) => {
  const result = await authService.login(req);
  return response.ok(res, result);
};

exports.logout = async (req, res) => {
  const result = await authService.logout(req);
  return response.ok(res, result);
};

exports.sendOTP = async (req, res) => {
  const result = await authService.sendOTP(req);
  return response.ok(res, result);
};

exports.resetPassword = async (req, res) => {
  const result = await authService.resetPassword(req);
  return response.ok(res, result);
};