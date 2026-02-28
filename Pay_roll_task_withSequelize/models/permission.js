module.exports = (sequelize, DataTypes) => {
    const permission = sequelize.define('permission', {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        desc: {
            type: DataTypes.TEXT,
        },
        deleted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
    }, {
        timestamps: true,
    });

    permission.associate = (db) => {
        permission.belongsToMany(db.role, {
            through: 'role_permissions',
            foreignKey: 'permissionId',
            otherKey: 'roleId',
            as: 'roles',
        });
    };

    return permission;
};

