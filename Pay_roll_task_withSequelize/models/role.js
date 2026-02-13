const { sequelize } = require(".");

module.exports = (sequelize,DataTypes)=>{
    const role = sequelize.define('role',{
        id:{
            type:DataTypes.INTEGER,
            allowNull:false,
            autoIncrement:true,
            primaryKey:true
        },
        name:{
            type:DataTypes.STRING,
            allowNull:false,
        },
        desc:{
            type:DataTypes.TEXT,
        },
        deleted:{
            type:DataTypes.BOOLEAN
        }
    },
    {
        timeStamps:true
    }
)

role.associate = (db)=>{
    role.hasOne(db.user,{foreignKey:"role_id"})
}

 return role;
}