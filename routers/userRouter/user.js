const express = require('express')
const router = new express.Router()

const crudController = require('../../controllers/user/userController')

//Read all and single user
router.get('/', crudController.readUsers)
router.get('/:emp_uid', crudController.readUser)

//Update user
router.patch('/:emp_uid', crudController.updateUser)

//Delete user
router.delete('/:emp_uid', crudController.deleteUser)

module.exports = router