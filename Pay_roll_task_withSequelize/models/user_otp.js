

function userOTP(sequelize,DataTypes){

    const userOtp = sequelize.define("userOtp",{
        id:{
            type:DataTypes.INTEGER,
            primaryKey:true,
            autoIncrement:true
        },
        userId:{
            type:DataTypes.INTEGER,
            allowNull:false
        },
        otp:{
            type:DataTypes.INTEGER,
            allowNull:false,
        },
        expire_time:{
            type:DataTypes.DATE,
            allowNull:false
        },
        deleted:{
            type:DataTypes.BOOLEAN,
            defaultValue:false
        }

    },{
        freezeTableName:true,
        tableName:"user_otp",
        timestamps: true,
    })


    userOtp.associate= (db)=>{
        userOtp.belongsTo(db.user,{foreignKey:"userId"})
    }

    return userOtp;
}

module.exports=userOTP