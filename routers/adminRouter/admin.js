const express = require('express')
const router = new express.Router()

const validateProfile = require("../../helpers/authHelper")
const adminCrudController = require('../../controllers/admin/adminController')

//Register Admin
router.post('/', validateProfile.validateUserProfile, adminCrudController.registerAdmin)

//Read all Admin's
router.get('/', validateProfile.validateToken, adminCrudController.readAdmins)

//Read individuall Admin
router.get('/:emp_uid', validateProfile.validateToken, adminCrudController.readAdmin)

//Update Admin
router.patch('/:emp_uid', validateProfile.validateToken,  adminCrudController.updateAdmin)

//Delete Admin
router.delete('/:emp_uid', validateProfile.validateToken,  adminCrudController.deleteAdmin)



module.exports = router