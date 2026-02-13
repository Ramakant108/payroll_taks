const express = require('express');
const authentication = require('../middleware/auth');
const { paginationValidation, getJobCandidate } = require('../utils/validation');
const errorHandler = require('../utils/errorHandler');
const { viewPostedJob, getCandidates } = require('../controller/recruiter');


const route=express.Router()

route.get("/recruiter/getjobs",authentication,paginationValidation,errorHandler(viewPostedJob));
route.get("/recruiter/getcandidate/:id",authentication,getJobCandidate,errorHandler(getCandidates))

module.exports = route;