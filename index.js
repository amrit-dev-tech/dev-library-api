const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
 const db = require('./src/config/database');
const router = require('./src/routers/router');

 

dotenv.config();
const app = express();
app.use(express.json());
app.use('/api', router);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


