const response = require('../utils/response');
const adminService = require('../service/admin');

exports.getAll = async (req, res) => {
  const result = await adminService.getAll(req);
  return response.ok(res, result);
};

exports.addRecruiter = async (req, res) => {
  const result = await adminService.addRecruiter(req);
  return response.created(res, result, { httpStatusCode: 200 });
};

exports.upadateRecruiter = async (req, res) => {
  const result = await adminService.upadateRecruiter(req);
  return response.ok(res, result);
};

exports.deleteUser = async (req, res) => {
  const result = await adminService.deleteUser(req);
  return response.ok(res, result);
};

exports.deleteJob = async (req, res) => {
  const result = await adminService.deleteJob(req);
  return response.ok(res, result);
};

exports.getCandidateApplyJob = async (req, res) => {
  const result = await adminService.getCandidateApplyJob(req);
  return response.ok(res, result);
};

exports.getExcelfile = async (req, res) => {
  const data = await adminService.getExcelfile(req);
  return res.send(data);
};