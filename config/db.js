const {Sequelize} = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
    process.env.DB_DATABASE,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'mysql',
        logging: false,
        dialectOptions: {
            connectTimeout: 60000,    // Move timeout here
            acquireTimeout: 60000,
            timeout: 60000
        },
        pool: {
            max: 10,
            min: 0,
            acquire: 60000,
            idle: 30000
        }
    }
);

// (async () => {
//     try {
//         await sequelize.authenticate();
//         console.log('DB connection: OK');
//     } catch (err) {
//         console.error('DB connection error:');
//         console.error({
//             message: err.message,
//             code: err.original?.code || err.code,
//             errno: err.original?.errno,
//             sqlState: err.original?.sqlState,
//         });
//     } finally {
//         await sequelize.close();
//     }
// })();

module.exports = sequelize;