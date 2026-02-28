
module.exports = (sequelize,DataTypes)=>{
    const user =sequelize.define("user",{
        id:{
            type:DataTypes.INTEGER,
            primaryKey:true,
            autoIncrement:true,
            allowNull:false
        },
        fname:{
            type:DataTypes.STRING,
            allowNull:false,
        },
        lname:{
            type:DataTypes.STRING,
            allowNull:false
        },
        email:{
            type:DataTypes.STRING,
            allowNull:false,
            unique:true
        },
        password:{
            type:DataTypes.STRING,
            allowNull:false,
        },
        role_id:{
            type:DataTypes.INTEGER,
            allowNull:false
        },
        deleted:{
            type:DataTypes.BOOLEAN,
            defaultValue:false
        }
    },
    {
        timestamps: true,
    }
)
 user.associate= (db)=>{
    user.belongsTo(db.role,{foreignKey:"role_id"})
    user.hasOne(db.userOtp,{foreignKey:"userId"})
    user.hasOne(db.job,{foreignKey:"recruiterId",as:"postedJob"})
    user.belongsToMany(db.job,{through:"job_applications",foreignKey:"userId",as:"jobs"})
 }
 
return user;
}