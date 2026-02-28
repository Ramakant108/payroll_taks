const response = require('../utils/response');
const jobService = require('../service/job');

exports.postJob = async (req, res) => {
  const result = await jobService.postJob(req);
  return response.created(res, result);
};

exports.findAll = async (req, res) => {
  const jobs = await jobService.findAll(req);
  return res.json(jobs);
};