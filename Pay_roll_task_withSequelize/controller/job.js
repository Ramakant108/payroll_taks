const { validationResult } = require("express-validator");
const { ValidationError, BusinessError } = require("../utils/customError");
const db = require("../models");
const Responce = require("../utils/responce");
const { Op } = require("sequelize");


async function postJob(req,res){

    const error = validationResult(req);
    if(!error.isEmpty()){
        throw new ValidationError(error.errors[0].msg)
    }
    const {title,description}=req.body
    const newjob = await db.job.create({title,description,recruiterId:req.userId});

    if(!newjob){
        throw new BusinessError("job not created please create again");
    }

    const result= Responce.created("job posted successfully",newjob)
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


    let where={
        ...(search && {[Op.or]:[
            {title:{[Op.iLike]:`%${search}%`}},
            {description:{[Op.iLike]:`%${search}%`}}
        ]}),
        deleted:false,
    }

    const jobs=await db.job.findAll({
        where,
        limit,
        offset,
        order:[["createdAt","DESC"]]
    });

    res.json(jobs)
}

module.exports = {postJob,findAll}