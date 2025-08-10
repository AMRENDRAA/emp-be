const express=require('express');
const sequelize=require('./config/db');
const Employee= require('./models/Employee');
const employeeRoutes=require('./routes/employeeRoutes');
const app=express();

const cors = require('cors');

app.use(cors({
     origin: "http://localhost:5173", // or ["http://localhost:3000", "https://yourfrontend.com"]
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: "Content-Type, Authorization"
}));

require('dotenv').config();
app.use(express.json());



app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.url}`);
  next();
});
//SYNC WITH DB


sequelize.sync().then(()=>{
    console.log('DB SYNCED ');
}).catch((err)=>{
 console.error('ERROR IN SYNC',err);

});

app.get('/',(req,res)=>{
    res.send('API RUNNING');

});

app.use('/api/employee',employeeRoutes);









const PORT=process.env.PORT ||8000;


app.listen(PORT,()=>{
    console.log(`server running on the port ${PORT}`);

})