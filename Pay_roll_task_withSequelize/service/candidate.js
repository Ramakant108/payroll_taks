const { validationResult } = require('express-validator');

const { ValidationError, BusinessError } = require('../utils/customError');
const db = require('../models');
const sendMail = require('../utils/sendMail');

async function applyJob(req) {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    throw new ValidationError(error.errors[0].msg);
  }

  const { id } = req.params;

  const job = await db.job.findByPk(id);
  if (!job) {
    throw new BusinessError('Job not found');
  }

  const existingApplication = await db.job_applications.findOne({
    where: {
      userId: req.userId,
      jobId: id,
    },
  });

  if (existingApplication) {
    throw new BusinessError('You have already applied for this job');
  }

  const application = await db.job_applications.create({
    userId: req.userId,
    jobId: id,
  });

  if (!application) {
    throw new BusinessError('Application not created');
  }

  const data = await db.user.findAll({
    where: {
      id: req.userId,
    },
    include: [
      {
        model: db.job,
        as: 'jobs',
        include: [
          {
            model: db.user,
            as: 'recruiter',
          },
        ],
        where: {
          id,
        },
      },
    ],
  });

  const candidateSubject = `Application Submitted Successfully – ${data[0].jobs[0].title}`;

  const candidateBody = `
Dear ${data[0].fname} ${data[0].lname}

Thank you for applying for the position of ${data[0].jobs[0].title}.

We’re happy to inform you that your application has been successfully submitted and is now under review by the recruiting team.

Job Details:
- Position: ${data[0].jobs[0].title}
- Description: ${data[0].jobs[0].description}
- Recruiter: ${data[0].jobs[0].recruiter.fname} ${data[0].jobs[0].recruiter.lname}

If your profile matches the job requirements, the recruiter may contact you for further steps.

Best of luck with your application!

Best regards,
Hiring Team
`;

  const recruiterSubject = `New Candidate Application – ${data[0].jobs[0].title}`;

  const recruiterBody = `
Dear ${data[0].jobs[0].recruiter.fname},

A new candidate has applied for the ${data[0].jobs[0].title} position.

Candidate Details:
- Name: ${data[0].fname} ${data[0].lname}
- Email: ${data[0].email}

Please log in to the recruitment portal to review the candidate’s profile and proceed with the next steps.

Regards,
Hiring Team
`;

  sendMail(
    process.env.EMAIL_USER,
    data[0].jobs[0].recruiter.email,
    recruiterSubject,
    recruiterBody,
  );
  sendMail(process.env.EMAIL_USER, data[0].email, candidateSubject, candidateBody);

  return { message: 'Applied successfully', data };
}

async function getAppliedJob(req) {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    throw new ValidationError(error.errors[0].msg);
  }

  const { pageNo, perPage } = req.query;
  let limit = perPage || 10;
  let pageNumber = pageNo || 1;
  let offset = limit * pageNumber - limit;

  const jobs = await db.job.findAndCountAll({
    include: [
      {
        model: db.user,
        as: 'candidates',
        where: {
          id: req.userId,
          deleted: false,
        },
        attributes: {
          exclude: ['password'],
        },
      },
    ],
    where: {
      deleted: false,
    },
    limit,
    offset,
  });

  return { message: 'All applied job', data: jobs };
}

module.exports = { applyJob, getAppliedJob };

