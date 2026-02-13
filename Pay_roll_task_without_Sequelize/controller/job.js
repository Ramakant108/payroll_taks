const { validationResult } = require("express-validator");
const { ValidationError, BusinessError } = require("../utils/customError");
const Responce = require("../utils/responce");
const pool = require("../config/pgPool");

async function postJob(req,res){

    const error = validationResult(req);
    if(!error.isEmpty()){
        throw new ValidationError(error.errors[0].msg)
    }
    const {title,description}=req.body

    const newJobResult = await pool.query(
        `INSERT INTO jobs (title, description, "recruiterId")
         VALUES ($1, $2, $3)
         RETURNING *`,
        [title, description, req.userId]
    );

    const newjob = newJobResult.rows[0];

    const result= Responce.created("job posted successfully", newjob)
    res.status(201).json(result)       
}


async function findAll(req,res){
    const error = validationResult(req);

    if(!error.isEmpty()){
         throw new ValidationError(error.errors[0].msg);
    }

    const {search,pageNo,perPage}=req.query;
    let limit=perPage||10;
    let pageNumber=pageNo||1;
    let offset=(limit*pageNumber)-limit;

    const params = [];
    let whereClauses = [`deleted = false`];

    if (search) {
        params.push(`%${search}%`, `%${search}%`);
        const firstIndex = params.length - 1;
        const secondIndex = params.length;
        whereClauses.push(`(title ILIKE $${firstIndex} OR description ILIKE $${secondIndex})`);
    }

    params.push(limit, offset);

    const limitIndex = params.length - 1;
    const offsetIndex = params.length;

    const jobsQuery = `
        SELECT *
        FROM jobs
        WHERE ${whereClauses.join(" AND ")}
        ORDER BY "createdAt" DESC
        LIMIT $${limitIndex}
        OFFSET $${offsetIndex}
    `;

    const jobsResult = await pool.query(jobsQuery, params);

    res.json(jobsResult.rows)
}

module.exports = {postJob,findAll}