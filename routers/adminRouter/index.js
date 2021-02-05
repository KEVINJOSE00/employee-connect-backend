const express = require('express')
const router = new express.Router()
const validateProfile = require("../../helpers/authHelper")

const adminAuthController = require('../../controllers/admin/authController')

//Login user
router.post('/login', adminAuthController.login)

//Logout Admin
router.post('/logout', validateProfile.validateToken, adminAuthController.logout, validateProfile.removeSession )

module.exports = router



// login
// registration
// view Profile
// update Profile
// delete profile 