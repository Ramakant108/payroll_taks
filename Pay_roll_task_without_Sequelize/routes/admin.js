const express = require("express");
const authentication = require("../middleware/auth");
const errorHandler = require("../utils/errorHandler");
const { paginationValidation, register, updateRecruiterValidation, applyTojobValidation } = require("../utils/validation");
const { getAll, addRecruiter, upadateRecruiter, deleteUser, deleteJob, getCandidateApplyJob, getExcelfile } = require("../controller/admin");

const route = express.Router();


route.get("/admin/get-all",authentication,paginationValidation,errorHandler(getAll));
route.post("/admin/recruiter",authentication,register,errorHandler(addRecruiter));
route.put("/admin/recruiter",authentication,updateRecruiterValidation,errorHandler(upadateRecruiter));
route.delete("/admin/candidate/:id",authentication,applyTojobValidation,errorHandler(deleteUser))
route.delete("/admin/job/:id",authentication,applyTojobValidation,errorHandler(deleteJob))
route.get("/admin/candidate-job/:id",authentication,applyTojobValidation,errorHandler(getCandidateApplyJob))
route.get("/admin/export",authentication,errorHandler(getExcelfile))
module.exports = route;