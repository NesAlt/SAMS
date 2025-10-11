const express = require('express');
const connectDB = require('./config/db');
const cors =require('cors');
const dotenv = require('dotenv');
const User = require('./models/User');


dotenv.config();

if (!process.env.PORT || !process.env.MONGO_URI) {
  console.error('Missing PORT or MONGO_URI in .env');
  process.exit(1);
}

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/Auth.route'));
app.use('/api/adminUser',require('./routes/AdminUsers.route'));

const PORT =process.env.PORT
connectDB().then(()=>{
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});