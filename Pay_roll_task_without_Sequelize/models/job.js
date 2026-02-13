

function jobs(sequelize,DataTypes){
    const job=sequelize.define('job',{
        id:{
            type:DataTypes.INTEGER,
            primaryKey:true,
            autoIncrement:true
        },
        title:{
            type:DataTypes.STRING,
            allowNull:false
        },
        description:{
            type:DataTypes.TEXT,
            allowNull:false
        },
        recruiterId:{
            type:DataTypes.INTEGER,
            allowNull:false
        },
        deleted:{
            type:DataTypes.BOOLEAN,
            defaultValue:false
        }
    },{
        timeStamps:true
    })
    
    job.associate = (db)=>{
        job.belongsTo(db.user,{foreignKey:"recruiterId",as:"recruiter"})
        job.belongsToMany(db.user,{through:"job_applications",foreignKey:"jobId",as:"candidates"})
    }
    return job;
}

module.exports =  jobs