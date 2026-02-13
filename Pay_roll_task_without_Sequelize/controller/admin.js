const { validationResult } = require("express-validator");
const { ValidationError, BusinessError } = require("../utils/customError");
const Responce = require("../utils/responce");
const bcrypt = require("bcryptjs");
const ExcelJs = require("exceljs");
const pool = require("../config/pgPool");
const path = require("path");

// GET /admin/all
async function getAll(req, res) {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    throw new ValidationError(error.errors[0].msg);
  }

  const { pageNo, perPage } = req.query;
  const limit = Number(perPage) || 10;
  const pageNumber = Number(pageNo) || 1;
  const offset = (limit * pageNumber) - limit;

  // recruiter list (role_id = 2)
  const recruiterCount = await pool.query(
    `SELECT COUNT(*)::int AS count
     FROM users
     WHERE deleted = false AND role_id = 2`
  );
  const recruiterRows = await pool.query(
    `SELECT id, fname, lname, email, role_id, deleted
     FROM users
     WHERE deleted = false AND role_id = 2
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  const recruiter = {
    count: recruiterCount.rows[0].count,
    rows: recruiterRows.rows,
  };

  // jobs
  const jobsCount = await pool.query(
    `SELECT COUNT(*)::int AS count
     FROM jobs
     WHERE deleted = false`
  );
  const jobsRows = await pool.query(
    `SELECT *
     FROM jobs
     WHERE deleted = false
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  const jobs = {
    count: jobsCount.rows[0].count,
    rows: jobsRows.rows,
  };

  // candidates list (role_id = 1)
  const candidateCount = await pool.query(
    `SELECT COUNT(*)::int AS count
     FROM users
     WHERE deleted = false AND role_id = 1`
  );
  const candidateRows = await pool.query(
    `SELECT id, fname, lname, email, role_id, deleted
     FROM users
     WHERE deleted = false AND role_id = 1
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  const candidate = {
    count: candidateCount.rows[0].count,
    rows: candidateRows.rows,
  };

  const result = Responce.ok("all fetched successfuly", {
    candidate,
    recruiter,
    jobs,
  });
  res.status(200).json(result);
}

// POST /admin/recruiter
async function addRecruiter(req, res) {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    throw new ValidationError(error.errors[0].msg);
  }

  const { lname, fname, email, password, role_id } = req.body;

  const recruiterResult = await pool.query(
    `SELECT id
     FROM users
     WHERE deleted = false AND email = $1`,
    [email]
  );

  if (recruiterResult.rowCount > 0) {
    throw new BusinessError("user already exist");
  }

  const hashPassword = await bcrypt.hash(password, 10);
  const newRecruiterResult = await pool.query(
    `INSERT INTO users (lname, fname, email, password, role_id)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, fname, lname, email, role_id, deleted`,
    [lname, fname, email, hashPassword, role_id]
  );
  const newRecruiter = newRecruiterResult.rows[0];

  const result = Responce.created("user created successfuly", newRecruiter);
  res.status(200).json(result);
}

// PUT /admin/recruiter
async function upadateRecruiter(req, res) {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    throw new ValidationError(error.errors[0].msg);
  }

  const updateData = { ...req.body };
  const fields = [];
  const values = [];
  let idx = 1;

  if (updateData.fname !== undefined) {
    fields.push(`fname = $${idx++}`);
    values.push(updateData.fname);
  }
  if (updateData.lname !== undefined) {
    fields.push(`lname = $${idx++}`);
    values.push(updateData.lname);
  }
  if (updateData.email !== undefined) {
    fields.push(`email = $${idx++}`);
    values.push(updateData.email);
  }
  if (updateData.password !== undefined) {
    const newPassword = await bcrypt.hash(updateData.password, 10);
    fields.push(`password = $${idx++}`);
    values.push(newPassword);
  }

  // original code updated all recruiters (role_id = 2) matching deleted=false
  if (fields.length > 0) {
    values.push(2); // role_id condition
    await pool.query(
      `UPDATE users
       SET ${fields.join(", ")}
       WHERE deleted = false AND role_id = $${idx}`,
      values
    );
  }

  const result = Responce.ok("updated successfuly", null);
  res.status(200).json(result);
}

// DELETE /admin/user/:id
async function deleteUser(req, res) {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    throw new ValidationError(error.errors[0].msg);
  }

  const { id } = req.params;

  const recruiterResult = await pool.query(
    `SELECT id, fname, lname, email, role_id, deleted
     FROM users
     WHERE deleted = false AND id = $1`,
    [id]
  );

  if (recruiterResult.rowCount === 0) {
    throw new BusinessError("user not present");
  }

  await pool.query(
    `UPDATE users
     SET deleted = true
     WHERE id = $1`,
    [id]
  );

  const result = Responce.ok("deleted successefuly", null);
  res.status(200).json(result);
}

// DELETE /admin/job/:id
async function deleteJob(req, res) {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    throw new ValidationError(error.errors[0].msg);
  }

  const { id } = req.params;

  const jobResult = await pool.query(
    `SELECT *
     FROM jobs
     WHERE deleted = false AND id = $1`,
    [id]
  );

  if (jobResult.rowCount === 0) {
    throw new BusinessError("job not present");
  }

  await pool.query(
    `UPDATE jobs
     SET deleted = true
     WHERE id = $1`,
    [id]
  );

  const result = Responce.ok("deleted successefuly", null);
  res.status(200).json(result);
}

// GET /admin/candidate/:id/jobs
async function getCandidateApplyJob(req, res) {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    throw new ValidationError(error.errors[0].msg);
  }

  const { id } = req.params;

  const appliedJobResult = await pool.query(
    `SELECT
        u.id AS user_id,
        u.fname,
        u.lname,
        u.email,
        j.id AS job_id,
        j.title,
        j.description,
        j."recruiterId"
     FROM users u
     JOIN job_applications ja
       ON ja."userId" = u.id
      AND ja.deleted = false
     JOIN jobs j
       ON j.id = ja."jobId"
      AND j.deleted = false
     WHERE u.deleted = false
       AND u.id = $1`,
    [id]
  );

  const userJobsMap = {};
  for (const row of appliedJobResult.rows) {
    if (!userJobsMap[row.user_id]) {
      userJobsMap[row.user_id] = {
        id: row.user_id,
        fname: row.fname,
        lname: row.lname,
        email: row.email,
        jobs: [],
      };
    }
    userJobsMap[row.user_id].jobs.push({
      id: row.job_id,
      title: row.title,
      description: row.description,
      recruiterId: row.recruiterid,
    });
  }

  const appliedJob = Object.values(userJobsMap);

  const result = Responce.ok(
    "candidate aplied job fetched successfuly",
    appliedJob
  );
  res.status(200).json(result);
}

// GET /admin/excel
async function getExcelfile(req, res) {
  const workbook = new ExcelJs.Workbook();
  const jobSheet = workbook.addWorksheet("Jobs");
  const candidatesSheet = workbook.addWorksheet("Candidate");
  const recruiterSheet = workbook.addWorksheet("Recruiter");

  // jobs with recruiter
  const jobDataResult = await pool.query(
    `SELECT j.id,
            j.title,
            j.description,
            j."recruiterId",
            u.email AS recruiter_email
     FROM jobs j
     JOIN users u ON u.id = j."recruiterId"
     WHERE j.deleted = false
       AND u.deleted = false`
  );
  const jobData = jobDataResult.rows.map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    recruiter: { email: row.recruiter_email },
  }));

  // candidate + jobs + application createdAt
  const candidateDataResult = await pool.query(
    `SELECT
        u.id AS user_id,
        u.fname,
        u.lname,
        u.email,
        j.id AS job_id,
        j.title,
        j.description,
        j."recruiterId",
        ja."createdAt" AS applied_at
     FROM users u
     JOIN job_applications ja
       ON ja."userId" = u.id
      AND ja.deleted = false
     JOIN jobs j
       ON j.id = ja."jobId"
      AND j.deleted = false
     WHERE u.deleted = false
       AND u.role_id = 1`
  );

  const candidateMap = {};
  for (const row of candidateDataResult.rows) {
    if (!candidateMap[row.user_id]) {
      candidateMap[row.user_id] = {
        id: row.user_id,
        fname: row.fname,
        lname: row.lname,
        email: row.email,
        jobs: [],
      };
    }
    candidateMap[row.user_id].jobs.push({
      id: row.job_id,
      title: row.title,
      description: row.description,
      recruiterId: row.recruiterid,
      job_applications: { createdAt: row.applied_at },
    });
  }
  const candidateData = Object.values(candidateMap);

  const recruiterDataResult = await pool.query(
    `SELECT id, fname, lname, email, role_id, deleted
     FROM users
     WHERE deleted = false AND role_id = 2`
  );
  const recruiterData = recruiterDataResult.rows;

  // columns
  jobSheet.columns = [
    { header: "ID", key: "id" },
    { header: "Title", key: "title" },
    { header: "Description", key: "description" },
    { header: "Recruiter", key: "email" },
  ];
  recruiterSheet.columns = [
    { header: "ID", key: "id" },
    { header: "FirstName", key: "fname" },
    { header: "LastName", key: "lname" },
    { header: "Email", key: "email" },
  ];
  candidatesSheet.columns = [
    { header: "ID", key: "id" },
    { header: "FirstName", key: "fname" },
    { header: "LastName", key: "lname" },
    { header: "Email", key: "email" },
    { header: "Job Title", key: "jobTitle" },
    { header: "Job description", key: "jobDesc" },
    { header: "RecruiterId", key: "recruiterId" },
    { header: "Applied Date", key: "appliedDate" },
  ];

  // candidate rows
  let candidateRow = candidateData.map((candidate) => {
    const rows = candidate.jobs.map((job) => ({
      id: candidate.id,
      fname: candidate.fname,
      lname: candidate.lname,
      email: candidate.email,
      jobTitle: job.title,
      jobDesc: job.description,
      recruiterId: job.recruiterId,
      appliedDate: job.job_applications.createdAt,
    }));
    return rows;
  });
  candidateRow = candidateRow.reduce((acc, item) => acc.concat(item), []);

  // job rows
  const jobsRow = jobData.map((jobs) => ({
    id: jobs.id,
    title: jobs.title,
    description: jobs.description,
    email: jobs.recruiter.email,
  }));

  jobSheet.addRows(jobsRow);
  recruiterSheet.addRows(recruiterData);
  candidatesSheet.addRows(candidateRow);
  const fileName = `${Date.now()}.xlsx`
  await workbook.xlsx.writeFile(
    path.join(__dirname, "../public/upload", fileName)
  );
  const url =`http://localhost:5000/upload/${fileName}`;
  res.status(200).json({url});
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