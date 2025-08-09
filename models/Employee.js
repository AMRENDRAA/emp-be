const { Model } = require('sequelize');
// const { DataTypes } = require('sequelize');

const {DataTypes}= require('sequelize');
const sequelize=require('../config/db');

const Employee= sequelize.define('Employee',{
    id:{
        type:DataTypes.INTEGER,
        autoIncrement:true,
        primaryKey:true
    },
    name:{
        type:DataTypes.STRING,
        allowNull:false
    },
    email:{
        type:DataTypes.STRING,

         allowNull:false
    },
    position:{
        type:DataTypes.STRING,
         allowNull:false
    }
    
    
},{
        tableName:'employees',
        timestamps:false
    }
);



module.exports=Employee;