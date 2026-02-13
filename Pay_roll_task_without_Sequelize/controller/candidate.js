const { validationResult } = require("express-validator");
const { ValidationError, BusinessError } = require("../utils/customError");
const Response = require("../utils/responce");
const { raw } = require("express");
const sendMail = require("../utils/sendMail");
const pool = require("../config/pgPool");

async function applyJob(req, res) {
    const error = validationResult(req);
    if (!error.isEmpty()) {
      throw new ValidationError(error.errors[0].msg);
    }

    const { id } = req.params;

    console.log(id)
    const jobResult = await pool.query(
      `SELECT * FROM jobs WHERE id = $1 AND deleted = false`,
      [id]
    );
    if (jobResult.rowCount === 0) {
      throw new BusinessError("Job not found");
    }

    const existingApplication = await pool.query(
      `SELECT * FROM job_applications
       WHERE "userId" = $1
         AND "jobId" = $2
         AND deleted = false`,
      [req.userId, id]
    );

    if (existingApplication.rowCount > 0) {
      throw new BusinessError("You have already applied for this job");
    }

    await pool.query(
      `INSERT INTO job_applications ("userId", "jobId")
       VALUES ($1, $2)`,
      [req.userId, id]
    );

    const dataResult = await pool.query(
      `SELECT
         c.id as candidate_id,
         c.fname as candidate_fname,
         c.lname as candidate_lname,
         c.email as candidate_email,
         j.id as job_id,
         j.title as job_title,
         j.description as job_description,
         r.id as recruiter_id,
         r.fname as recruiter_fname,
         r.lname as recruiter_lname,
         r.email as recruiter_email
       FROM users c
       JOIN job_applications ja ON ja."userId" = c.id
       JOIN jobs j ON j.id = ja."jobId"
       JOIN users r ON r.id = j."recruiterId"
       WHERE c.id = $1
         AND j.id = $2
         AND c.deleted = false
         AND j.deleted = false
         AND r.deleted = false`,
      [req.userId, id]
    );

    if (dataResult.rowCount === 0) {
      throw new BusinessError("Application not created");
    }

    const row = dataResult.rows[0];

    const data = [
      {
        id: row.candidate_id,
        fname: row.candidate_fname,
        lname: row.candidate_lname,
        email: row.candidate_email,
        jobs: [
          {
            id: row.job_id,
            title: row.job_title,
            description: row.job_description,
            recruiter: {
              id: row.recruiter_id,
              fname: row.recruiter_fname,
              lname: row.recruiter_lname,
              email: row.recruiter_email,
            },
          },
        ],
      },
    ];


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
    
    sendMail(process.env.EMAIL_USER,data[0].jobs[0].recruiter.email,recruiterSubject,recruiterBody);
    sendMail(process.env.EMAIL_USER,data[0].email,candidateSubject,candidateBody);

    const result = Response.created("Applied successfully", data);
    return res.status(201).json(result);
}

async function getAppliedJob(req,res){
      const error = validationResult(req)

      if(!error.isEmpty()){
        throw new ValidationError(error.errors[0].msg)
      }
    const {pageNo,perPage}=req.query;
    let limit=perPage||10;
    let pageNumber=pageNo||1;
    let offset=(limit*pageNumber)-limit;

      const countResult = await pool.query(
        `SELECT COUNT(DISTINCT j.id)::int AS count
         FROM jobs j
         JOIN job_applications ja ON ja."jobId" = j.id AND ja.deleted = false
         JOIN users u ON u.id = ja."userId" AND u.deleted = false
         WHERE j.deleted = false
           AND u.id = $1`,
        [req.userId]
      );

      const rowsResult = await pool.query(
        `SELECT j.*,
                json_agg(
                  json_build_object(
                    'id', u.id,
                    'fname', u.fname,
                    'lname', u.lname,
                    'email', u.email,
                    'role_id', u.role_id,
                    'deleted', u.deleted
                  )
                ) AS candidates
         FROM jobs j
         JOIN job_applications ja ON ja."jobId" = j.id AND ja.deleted = false
         JOIN users u ON u.id = ja."userId" AND u.deleted = false
         WHERE j.deleted = false
           AND u.id = $1
         GROUP BY j.id
         LIMIT $2 OFFSET $3`,
        [req.userId, limit, offset]
      );

      const jobs = {
        count: countResult.rows[0].count,
        rows: rowsResult.rows,
      };

      const result = Response.ok("All applied job",jobs)
      res.status(200).json(result)
}

module.exports = {applyJob , getAppliedJob};
