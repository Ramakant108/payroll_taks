const express = require('express');
const authentication = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { paginationValidation, getJobCandidate } = require('../utils/validation');
const errorWrapper = require('../utils/errorWrapper');
const { viewPostedJob, getCandidates } = require('../controller/recruiter');

const route = express.Router();

// only recruiter can see their jobs and candidates
route.get("/recruiter/jobs",authentication,authorize(['recruiter']),paginationValidation,errorWrapper(viewPostedJob));
route.get("/recruiter/jobs/:id/candidates",authentication,authorize(['recruiter']),getJobCandidate,errorWrapper(getCandidates))
module.exports = route;