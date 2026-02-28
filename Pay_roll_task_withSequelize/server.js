const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const databaseConnection = require('./config/dbConnection.js');
const { CustomError } = require('./utils/customError.js');
const db = require('./models');
const { createRedisClient } = require('./config/redisConnection');
const auth = require('./routes/auth.js');
const recruiter = require('./routes/recruiter.js')
const job = require('./routes/job.js')
const candidate = require('./routes/candidate.js')
const admin = require('./routes/admin.js')
const createHttpError = require('http-errors');
const path = require("path")
const logger = require('morgan');
dotenv.config();

const app=express();
const PORT=process.env.PORT || 5000;
app.use(cors())
app.use(express.static(path.join(__dirname,"public")))
app.use(express.json())
app.use(logger('dev'));

// initialize redis connection once at startup
createRedisClient().catch((err) => {
  console.error('Failed to connect to Redis', err);
});

app.use("/api",auth)
app.use("/api",recruiter)
app.use("/api",job)
app.use("/api",candidate)
app.use("/api",admin)
app.use((req,res,next)=>{
    next(createHttpError(404))
})
app.use(async(err,req,res,next)=>{
        const statusCode = err?.statusCode || 500;

        try {
            if (db?.errorLogger?.create) {
                await db.errorLogger.create({
                    name: err?.name,
                    message: err?.message || 'Unknown error',
                    stack: err?.stack,
                    statusCode,
                    method: req?.method,
                    path: req?.originalUrl || req?.url,
                    params: req?.params,
                    query: req?.query,
                    body: req?.body,
                    userId: req?.userId,
                });
            }
        } catch (logErr) {
            console.log(logErr);
        }

        if(err instanceof CustomError){
            console.log(err)
            return res.status(err.statusCode).json({ statusCode: err.statusCode, message: err.message })
        }
        console.log(err)

        return res.status(statusCode).json({statusCode:statusCode,message:err.message})
})
databaseConnection()
app.listen(PORT,()=>{
    console.log(`server running on port ${PORT}`)
})