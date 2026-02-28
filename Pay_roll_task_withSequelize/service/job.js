const { validationResult } = require('express-validator');
const { Op } = require('sequelize');

const { ValidationError, BusinessError } = require('../utils/customError');
const db = require('../models');

async function postJob(req) {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    throw new ValidationError(error.errors[0].msg);
  }

  const { title, description } = req.body;
  const newjob = await db.job.create({ title, description, recruiterId: req.userId });

  if (!newjob) {
    throw new BusinessError('job not created please create again');
  }

  return { message: 'job posted successfully', data: newjob };
}

async function findAll(req) {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    throw new ValidationError(error.errors[0].msg);
  }

  const { search, pageNo, perPage } = req.query;
  let limit = perPage || 10;
  let pageNumber = pageNo || 1;
  let offset = limit * pageNumber - limit;

  let where = {
    ...(search && {
      [Op.or]: [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ],
    }),
    deleted: false,
  };

  const jobs = await db.job.findAll({
    where,
    limit,
    offset,
    order: [['createdAt', 'DESC']],
  });

  return jobs;
}

module.exports = { postJob, findAll };

