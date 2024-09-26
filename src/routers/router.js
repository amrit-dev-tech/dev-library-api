// routes/router.js
const express = require('express');
const router = express.Router();
const { validateSignupPayload } = require('./validator');
const userController = require('../controllers/userController');

// Signup route
router.post('/signup', validateSignupPayload, userController.signup);

// Future route for login
router.post('/login', userController.login);

// Assined Book
router.post('/BookAssined', userController.BookAssined);


// Get Assined Book
router.post('/AssinedDetail', userController.AssinedDetail);

// export exele
router.get('/ExelExport', userController.ExelExport);



module.exports = router;
