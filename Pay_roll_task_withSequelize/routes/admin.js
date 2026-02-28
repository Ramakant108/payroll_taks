const express = require("express");
const authentication = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const errorWrapper = require("../utils/errorWrapper");
const { paginationValidation, register, updateRecruiterValidation, applyTojobValidation } = require("../utils/validation");
const { getAll, addRecruiter, upadateRecruiter, deleteUser, deleteJob, getCandidateApplyJob, getExcelfile } = require("../controller/admin");

const route = express.Router();

// only admin can access admin APIs
route.get("/admin",authentication,authorize(['admin']),paginationValidation,errorWrapper(getAll));
route.post("/admin/recruiters",authentication,authorize(['admin']),register,errorWrapper(addRecruiter));
route.put("/admin/recruiters",authentication,authorize(['admin']),updateRecruiterValidation,errorWrapper(upadateRecruiter));
route.delete("/admin/candidates/:id",authentication,authorize(['admin']),applyTojobValidation,errorWrapper(deleteUser))
route.delete("/admin/jobs/:id",authentication,authorize(['admin']),applyTojobValidation,errorWrapper(deleteJob))
route.get("/admin/candidates/:id/jobs",authentication,authorize(['admin']),applyTojobValidation,errorWrapper(getCandidateApplyJob))
route.get("/admin/export",authentication,authorize(['admin']),errorWrapper(getExcelfile))

module.exports = route;