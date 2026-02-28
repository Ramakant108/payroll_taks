const recruiterService = require('../service/recruiter');

exports.viewPostedJob = async (req, res) => {
  const jobPosted = await recruiterService.viewPostedJob(req);
  return res.send(jobPosted);
};

exports.getCandidates = async (req, res) => {
  const candidate = await recruiterService.getCandidates(req);
  return res.send(candidate);
};