

function jobApplication(sequelize,DataTypes){

    const job_applications=sequelize.define("job_applications",{
        id:{
            type:DataTypes.INTEGER,
            primaryKey:true,
            autoIncrement:true
        },
        userId:{
            type:DataTypes.INTEGER,
            allowNull:false,
        },
        jobId:{
            type:DataTypes.INTEGER,
            allowNull:false,
        },
        deleted:{
            type:DataTypes.BOOLEAN,
            defaultValue:false
        }
    },{
        timeStamps:true
    })
    return job_applications;
}

module.exports = jobApplication;