const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger.js');
const databaseConnection = require('./config/dbConnection.js');
const { CustomError } = require('./utils/customError.js');
const auth = require('./routes/auth.js');
const recruiter = require('./routes/recruiter.js')
const job = require('./routes/job.js')
const candidate = require('./routes/candidate.js')
const admin = require('./routes/admin.js')
const createHttpError = require('http-errors');
const path = require("path")
dotenv.config();

const app=express();
const PORT=process.env.PORT || 5000;
app.use(cors())
app.use(express.static(path.join(__dirname,"public")))
app.use(express.json())

// Swagger API docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api",auth)
app.use("/api",recruiter)
app.use("/api",job)
app.use("/api",candidate)
app.use("/api",admin)
app.use((req,res,next)=>{
    next(createHttpError(404))
})
app.use(async(err,req,res,next)=>{
        if(err instanceof CustomError){
            res.status(err.statusCode).json({ statusCode: err.statusCode, message: err.message })
            console.log(err)
        }
        console.log(err)

        res.status(err.statusCode || 500).json({statusCode:err.statusCode || 500,message:err.message})
})

databaseConnection()
app.listen(PORT,()=>{
    console.log(`server running on port ${PORT}`)
})