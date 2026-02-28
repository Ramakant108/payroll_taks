const express = require('express');
const authentication = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const errorWrapper = require('../utils/errorWrapper');
const {applyJob , getAppliedJob}= require('../controller/candidate');
const { applyTojobValidation, paginationValidation } = require('../utils/validation');

const route=express.Router()

// only candidate can apply and view their applications
route.post("/jobs/:id/applications",authentication,authorize(['candidate']),applyTojobValidation,errorWrapper(applyJob));
route.get("/candidates/applications",authentication,authorize(['candidate']),paginationValidation,errorWrapper(getAppliedJob))

module.exports = route;