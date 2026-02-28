const { validationResult } = require('express-validator');

const { ValidationError } = require('../utils/customError');
const db = require('../models');

async function viewPostedJob(req) {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    throw new ValidationError(error.errors[0].msg);
  }

  const { pageNo, perPage } = req.query;
  let limit = perPage || 10;
  let pageNumber = pageNo || 1;
  let offset = limit * pageNumber - limit;

  const jobPosted = await db.job.findAndCountAll({
    where: {
      deleted: false,
      recruiterId: req.userId,
    },
    limit,
    offset,
  });

  return jobPosted;
}

async function getCandidates(req) {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    throw new ValidationError(error.errors[0].msg);
  }

  const { id } = req.params;
  const { pageNo, perPage } = req.query;
  let limit = perPage || 10;
  let pageNumber = pageNo || 1;
  let offset = limit * pageNumber - limit;

  const candidate = await db.job.findAndCountAll({
    where: {
      id,
      deleted: false,
    },
    include: [
      {
        model: db.user,
        as: 'candidates',
        where: {
          deleted: false,
        },
        attributes: {
          exclude: ['password'],
        },
      },
    ],
    limit,
    offset,
  });

  return candidate;
}

module.exports = { viewPostedJob, getCandidates };

