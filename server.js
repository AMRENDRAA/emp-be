const express = require('express');
const sequelize = require('./config/db');
const Employee = require('./models/Employee');
const employeeRoutes = require('./routes/employeeRoutes');
const app = express();

const authRoutes = require('./routes/authRoutes'); // Add this line

const cors = require('cors');

app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://empfe-4aouns8zk-amrendra-rajs-projects.vercel.app" // Add your Vercel URL
  ],
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: "Content-Type, Authorization",
  credentials: true
}));

require('dotenv').config();
app.use(express.json());

// ADDING COOKIE PARSER FOR THE REFRESH TOKENS

const cookieParser = require('cookie-parser');
app.use(cookieParser());


app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.url}`);
  next();
});
//SYNC WITH DB


sequelize.sync().then(() => {
  console.log('DB SYNCED ');
}).catch((err) => {
  console.error('ERROR IN SYNC', err);

});

app.get('/', (req, res) => {
  res.send('API RUNNING');

});

app.use('/api/employee', employeeRoutes);

app.use('/auth', authRoutes); // Add this line









const PORT = process.env.PORT || 8000;


app.listen(PORT, () => {
  console.log(`server running on the port ${PORT}`);

})