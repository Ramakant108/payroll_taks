const express = require('express');
const authentication = require('../middleware/auth');
const errorHandler = require('../utils/errorHandler');
const {applyJob , getAppliedJob}= require('../controller/candidate');
const { applyTojobValidation, paginationValidation } = require('../utils/validation');



const route=express.Router()

route.post("/candidate/apply/:id",authentication,applyTojobValidation,errorHandler(applyJob));
route.get("/candidate/getjob",authentication,paginationValidation,errorHandler(getAppliedJob))

module.exports = route;