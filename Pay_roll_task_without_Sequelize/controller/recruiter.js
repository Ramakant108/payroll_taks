const { validationResult } = require("express-validator");
const { ValidationError } = require("../utils/customError");
const Responce = require("../utils/responce");
const pool = require("../config/pgPool");

// async function addJob(req,res){

//     const error = validationResult(req);
//     if(!error.isEmpty()){
//         throw new ValidationError(error.errors[0].msg)
//     }
//     const {title,description}=req.body
//     const newjob = await db.job.create({title,description,recruiterId:req.userId});

//     if(!newjob){
//         throw new BusinessError("job not created please create again");
//     }

//     const result= Responce.created("job posted successfully",newjob)
//     res.status(201).json(result)       
// }

async function viewPostedJob(req,res){

    const error = validationResult(req);
    if(!error.isEmpty()){
        throw new ValidationError(error.errors[0].msg);
    }

    const {pageNo,perPage}=req.query;
    let limit=perPage||10;
    let pageNumber=pageNo||1;
    let offset=(limit*pageNumber)-limit;

    const countResult = await pool.query(
        `SELECT COUNT(*)::int AS count
         FROM jobs
         WHERE deleted = false AND "recruiterId" = $1`,
        [req.userId]
    );

    const rowsResult = await pool.query(
        `SELECT *
         FROM jobs
         WHERE deleted = false AND "recruiterId" = $1
         LIMIT $2 OFFSET $3`,
        [req.userId, limit, offset]
    );

    const jobPosted = {
        count: countResult.rows[0].count,
        rows: rowsResult.rows
    };

    res.send(jobPosted)
}

async function getCandidates(req,res){
    const error = validationResult(req);
    if(!error.isEmpty()){
        throw new ValidationError(error.errors[0].msg);
    }
    const {id} = req.params
    const {pageNo,perPage}=req.query;
    let limit=perPage||10;
    let pageNumber=pageNo||1;
    let offset=(limit*pageNumber)-limit;

    const countResult = await pool.query(
        `SELECT COUNT(*)::int AS count
         FROM job_applications ja
         JOIN users u ON u.id = ja."userId"
         WHERE ja."jobId" = $1
           AND ja.deleted = false
           AND u.deleted = false`,
        [id]
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
         WHERE j.id = $1
           AND j.deleted = false
         GROUP BY j.id
         LIMIT $2 OFFSET $3`,
        [id, limit, offset]
    );

    const candidate = {
        count: countResult.rows[0].count,
        rows: rowsResult.rows
    };

    res.send(candidate)

}
module.exports = {viewPostedJob,getCandidates}