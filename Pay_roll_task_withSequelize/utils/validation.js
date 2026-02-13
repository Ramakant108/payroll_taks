const { body, query, param } = require("express-validator");

const register= [
    body('fname').notEmpty().withMessage("first name not be empty")
    .isString().withMessage("name must be string"),
    body("lname").notEmpty().withMessage("first name not be empty")
    .isString().withMessage("name must be string"),
    body('email').isEmail().withMessage('email format is not correct'),
    body('password').isStrongPassword({minLength:8,minLowercase:1,minNumbers:1,minSymbols:1,minUppercase:1}).withMessage("Password should be strong")
]

const loginValidation = [
    body("email").notEmpty().withMessage("email required").isEmail().withMessage("email format is not correct"),
    body('password').notEmpty().withMessage("Password required")
]

const sendOtp = [
    body("email").notEmpty().withMessage("email required").isEmail().withMessage("Eamil format is wrong"),
]

const resetPasswordValidation=[
    body('email').notEmpty().withMessage("Email required").isEmail().withMessage('email format is not correct'),
    body('newPassword').notEmpty().withMessage("new password required").isStrongPassword({minLength:8,minLowercase:1,minNumbers:1,minSymbols:1,minUppercase:1}).withMessage("Password should be strong"),
    body('otp').notEmpty().withMessage("insert the otp").isInt().withMessage("otp must be number")
]

const addJobValidation = [
    body('title').notEmpty().withMessage("title must requiered").isString().withMessage("must be string"),
    body("description").notEmpty().withMessage("descrition required")
]

const paginationValidation = [
    query("search").optional().isString().withMessage("search field must be string"),
    query('pageNo').optional().isInt().withMessage("pageNo must be Number"),
    query("perPage").optional().isInt().withMessage("perPage must be Number")
]

const applyTojobValidation = [
    param("id").notEmpty().withMessage("id must required").isInt().withMessage("id must be number")
]
const getJobCandidate = [
     query("search").optional().isString().withMessage("search field must be string"),
    query('pageNo').optional().isInt().withMessage("pageNo must be Number"),
    query("perPage").optional().isInt().withMessage("perPage must be Number"),
    param("id").notEmpty().withMessage("id must required").isInt().withMessage("id must be number")
]

const updateRecruiterValidation = [
    body('fname').optional()
    .isString().withMessage("name must be string"),
    body("lname").optional()
    .isString().withMessage("name must be string"),
    body('email').optional().isEmail().withMessage('email format is not correct'),
    body('password').optional().isStrongPassword({minLength:8,minLowercase:1,minNumbers:1,minSymbols:1,minUppercase:1}).withMessage("Password should be strong")
]
module.exports={register,loginValidation,sendOtp,resetPasswordValidation,addJobValidation,paginationValidation,applyTojobValidation,getJobCandidate,updateRecruiterValidation}