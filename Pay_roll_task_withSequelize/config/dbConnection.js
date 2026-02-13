const db = require("../models/index.js");
async function databaseConnection() {
    try {
        await db.sequelize.authenticate()
        await db.sequelize.sync({ alter: true })
        console.log("Database connected successfuly")
    } catch (error) {
        console.log(error)
        setTimeout(()=>databaseConnection(),5000)
    }

}
module.exports = databaseConnection

