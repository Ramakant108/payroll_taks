const response = require('../utils/response');
const candidateService = require('../service/candidate');

exports.applyJob = async (req, res) => {
  const result = await candidateService.applyJob(req);
  return response.created(res, result);
};

exports.getAppliedJob = async (req, res) => {
  const result = await candidateService.getAppliedJob(req);
  return response.ok(res, result);
};
