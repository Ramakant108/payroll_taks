const { validationResult } = require("express-validator");
const { ValidationError, BusinessError } = require("../utils/customError");
const db = require("../models");
const Responce = require("../utils/responce");


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

    const jobPosted = await db.job.findAndCountAll({
        where:{
            deleted:false,
            recruiterId:req.userId
        },
        limit,
        offset
    })

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

    const candidate = await db.job.findAndCountAll({
        where:{
            id,
            deleted:false
        },
        include:[{
            model:db.user,
            as:"candidates",
            where:{
                deleted:false,
            },
            attributes: {
            exclude: ["password"]
        }
        }],
        limit,
        offset
    })
    res.send(candidate)

}
module.exports = {viewPostedJob,getCandidates}