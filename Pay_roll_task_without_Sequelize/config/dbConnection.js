const pool = require('./pgPool');

async function databaseConnection() {
    try {
        // Simple test query to verify connection
        await pool.query('SELECT 1');
        console.log('Database connected successfully');
    } catch (error) {
        console.log(error);
        setTimeout(() => databaseConnection(), 5000);
    }
}

module.exports = databaseConnection;
