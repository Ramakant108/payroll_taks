module.exports = (sequelize, DataTypes) => {
  const errorLogger = sequelize.define(
    'errorLogger',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      stack: {
        type: DataTypes.TEXT,
      },
      statusCode: {
        type: DataTypes.INTEGER,
      },
      method: {
        type: DataTypes.STRING,
      },
      path: {
        type: DataTypes.STRING,
      },
      params: {
        type: DataTypes.JSON,
      },
      query: {
        type: DataTypes.JSON,
      },
      body: {
        type: DataTypes.JSON,
      },
      userId: {
        type: DataTypes.INTEGER,
      },
      deleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      timestamps: true,
    },
  );

  return errorLogger;
};

