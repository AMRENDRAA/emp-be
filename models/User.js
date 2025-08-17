const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');


const User = sequelize.define('User',
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        email: {
            type: DataTypes.STRING
        },
        password: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        role: {
            type: DataTypes.ENUM('ADMIN', 'HR', 'MANAGER', 'EMPLOYEE'),
            defaultValue: 'Employee'
        },
        departmentId: {
            type: DataTypes.INTEGER,
            allowNull: true
        }
    },
    {
        timestamps: true,
        tableName: 'users'
    }

)
module.exports = User;