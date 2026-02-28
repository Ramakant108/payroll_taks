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
        timestamps: true,
    }
)

role.associate = (db)=>{
    role.hasOne(db.user,{foreignKey:"role_id"})
    role.belongsToMany(db.permission,{
        through:'role_permissions',
        foreignKey:'roleId',
        otherKey:'permissionId',
        as:'permissions'
    })
}

 return role;
}