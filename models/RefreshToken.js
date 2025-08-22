const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');
const { USE } = require('sequelize/lib/index-hints');

const RefreshToken = sequelize.define('RefreshToken', {

    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    tokenHash: {
        type: DataTypes.STRING(200),
        allowNull: false
    },
    expiresAt: {
        type: DataTypes.DATE,
        allowNull: false
    },
    revokedAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    userAgent: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    ip: {
        type: DataTypes.STRING(255),
        allowNull: true
    }


}, {
    timestamps: true,
    tableName: 'refresh_tokens'
}

)



RefreshToken.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(RefreshToken, { foreignKey: 'userId' });
module.exports = RefreshToken;
