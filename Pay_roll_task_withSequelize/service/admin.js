const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const ExcelJs = require('exceljs');
const path = require('path');

const { ValidationError, BusinessError } = require('../utils/customError');
const db = require('../models');

async function getAll(req) {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    throw new ValidationError(error.errors[0].msg);
  }

  const { pageNo, perPage } = req.query;
  let limit = perPage || 10;
  let pageNumber = pageNo || 1;
  let offset = limit * pageNumber - limit;

  const recruiter = await db.user.findAndCountAll({
    where: {
      deleted: false,
      role_id: 2,
    },
    attributes: { exclude: ['password'] },
    limit,
    offset,
  });

  const jobs = await db.job.findAndCountAll({
    where: {
      deleted: false,
    },
    limit,
    offset,
  });

  const candidate = await db.user.findAndCountAll({
    where: {
      deleted: false,
      role_id: 1,
    },
    attributes: { exclude: ['password'] },
    limit,
    offset,
  });

  return {
    message: 'all fetched successfuly',
    data: { candidate, recruiter, jobs },
  };
}

async function addRecruiter(req) {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    throw new ValidationError(error.errors[0].msg);
  }

  const { lname, fname, email, password, role_id } = req.body;

  const recruiter = await db.user.findOne({
    where: {
      deleted: false,
      email,
    },
    attributes: {
      exclude: ['password'],
    },
  });

  if (recruiter) {
    throw new BusinessError('user already exist');
  }

  const hashPassword = await bcrypt.hash(password, 10);
  const newRecruiter = await db.user.create({
    lname,
    fname,
    email,
    password: hashPassword,
    role_id,
  });

  return { message: 'user created successfuly', data: newRecruiter };
}

async function upadateRecruiter(req) {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    throw new ValidationError(error.errors[0].msg);
  }

  const updateData = { ...req.body };
  if (updateData.password) {
    let newPassword = await bcrypt.hash(updateData.password, 10);
    updateData.password = newPassword;
  }

  await db.user.update(updateData, {
    where: {
      deleted: false,
      role_id: 2,
    },
  });

  return { message: 'updated successfuly', data: null };
}

async function deleteUser(req) {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    throw new ValidationError(error.errors[0].msg);
  }

  const { id } = req.params;

  const recruiter = await db.user.findOne({
    where: {
      deleted: false,
      id,
    },
    attributes: {
      exclude: ['password'],
    },
  });

  if (!recruiter) {
    throw new BusinessError('user not present');
  }

  await db.user.update(
    { deleted: true },
    {
      where: {
        id,
      },
    },
  );

  return { message: 'deleted successefuly', data: null };
}

async function deleteJob(req) {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    throw new ValidationError(error.errors[0].msg);
  }

  const { id } = req.params;

  const job = await db.job.findOne({
    where: {
      deleted: false,
      id,
    },
  });

  if (!job) {
    throw new BusinessError('job not present');
  }

  await db.job.update(
    { deleted: true },
    {
      where: {
        id,
      },
    },
  );

  return { message: 'deleted successefuly', data: null };
}

async function getCandidateApplyJob(req) {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    throw new ValidationError(error.errors[0].msg);
  }

  const { id } = req.params;

  const appliedJob = await db.user.findAll({
    where: {
      deleted: false,
      id,
    },
    include: [
      {
        model: db.job,
        as: 'jobs',
        where: {
          deleted: false,
        },
      },
    ],
    attributes: {
      exclude: ['password'],
    },
  });

  return {
    message: 'candidate aplied job fetched successfuly',
    data: appliedJob,
  };
}

async function getExcelfile(req) {
  const workbook = new ExcelJs.Workbook();
  const job = workbook.addWorksheet('Jobs');
  const candidates = workbook.addWorksheet('Candidate');
  const recruiter = workbook.addWorksheet('Recruiter');

  const jobData = await db.job.findAll({
    where: {
      deleted: false,
    },
    include: [
      {
        model: db.user,
        as: 'recruiter',
        where: {
          deleted: false,
        },
        attributes: {
          exclude: ['password'],
        },
      },
    ],
  });

  const candidateData = await db.user.findAll({
    where: {
      deleted: false,
      role_id: 1,
    },
    include: [
      {
        model: db.job,
        as: 'jobs',
        where: {
          deleted: false,
        },
      },
    ],
    attributes: {
      exclude: ['password'],
    },
  });

  const recruiterData = await db.user.findAll({
    where: {
      deleted: false,
      role_id: 2,
    },
    attributes: {
      exclude: ['password'],
    },
  });

  job.columns = [
    { header: 'ID', key: 'id' },
    { header: 'Title', key: 'title' },
    { header: 'Description', key: 'description' },
    { header: 'Recruiter', key: 'email' },
  ];

  recruiter.columns = [
    { header: 'ID', key: 'id' },
    { header: 'FirstName', key: 'fname' },
    { header: 'LastName', key: 'lname' },
    { header: 'Email', key: 'email' },
  ];

  candidates.columns = [
    { header: 'ID', key: 'id' },
    { header: 'FirstName', key: 'fname' },
    { header: 'LastName', key: 'lname' },
    { header: 'Email', key: 'email' },
    { header: 'Job Title', key: 'jobTitle' },
    { header: 'Job description', key: 'jobDesc' },
    { header: 'RecruiterId', key: 'recruiterId' },
    { header: 'Applied Date', key: 'appliedDate' },
  ];

  let candidateRow = candidateData.map((candidate) => {
    let data = candidate.jobs.map((job) => ({
      id: candidate.id,
      fname: candidate.fname,
      lname: candidate.lname,
      email: candidate.email,
      jobTitle: job.title,
      jobDesc: job.description,
      recruiterId: job.recruiterId,
      appliedDate: job.job_applications.createdAt,
    }));
    return data;
  });

  candidateRow = candidateRow.reduce((acc, item) => {
    acc = [...acc, ...item];
    return acc;
  }, []);

  let jobsRow = jobData.map((jobs) => ({
    id: jobs.id,
    title: jobs.title,
    description: jobs.description,
    email: jobs.recruiter.email,
  }));

  job.addRows(jobsRow);
  recruiter.addRows(recruiterData);
  candidates.addRows(candidateRow);

  await workbook.xlsx.writeFile(
    path.join(__dirname, '../public/upload', `${Date.now()}.xlsx`),
  );

  // keep exact existing output shape for this endpoint
  return { candidateData, recruiterData, jobData };
}

module.exports = {
  getAll,
  addRecruiter,
  upadateRecruiter,
  deleteUser,
  deleteJob,
  getCandidateApplyJob,
  getExcelfile,
};

