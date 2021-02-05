const express = require('express')
const router = new express.Router()
const validateProfile = require("../../helpers/authHelper")

const crudController = require('../../controllers/user/userController')
const authController = require('../../controllers/user/authController')

//Register User
router.post('/', validateProfile.validateUserProfile, crudController.registerUser)

//Login user
router.post('/login', authController.login)


module.exports = router



// login
// registration
// view Profile
// update Profile
// delete profile 