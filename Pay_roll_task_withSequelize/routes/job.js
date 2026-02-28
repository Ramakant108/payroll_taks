const express = require('express');
const authentication = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const errorWrapper = require('../utils/errorWrapper');
const { postJob, findAll } = require('../controller/job');
const { addJobValidation, paginationValidation } = require('../utils/validation');

const route=express.Router()

// only recruiter can post jobs
route.post('/jobs',authentication,authorize(['recruiter']),addJobValidation, errorWrapper(postJob))

// jobs listing can be accessed by any authenticated user (no role restriction)
route.get("/jobs",authentication,paginationValidation,errorWrapper(findAll))


module.exports = route