const express = require('express');
const authentication = require('../middleware/auth');
const errorHandler = require('../utils/errorHandler');
const { postJob, findAll } = require('../controller/job');
const { addJobValidation, paginationValidation } = require('../utils/validation');

const route=express.Router()

route.post('/job',authentication,addJobValidation, errorHandler(postJob))

route.get("/jobs",authentication,paginationValidation,errorHandler(findAll))


module.exports = route