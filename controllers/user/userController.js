const userModel = require('../../models/userModel')
const {BadRequest, NotFound, ServerError} = require('../../helpers/errorHelper');
const validateProfile = require("../../helpers/authHelper")


var registerUser = async (req, res, next) => {
    const { name, email, password} = req.body
    try{
        var hashedPassword = await validateProfile.encryptPassword(req.body.password)
        var emailAlreadyExist = await userModel.countUserModel({email})
        if(emailAlreadyExist > 0) throw new BadRequest("The email already exist!")

        var result = await userModel.createUserModel({name, email, password: hashedPassword})
        if(result.affectedRows == 0) throw new ServerError();
        req.response.message = "Data inserted successfully!"
        req.response.data = req.body
        res.json(req.response)
    }catch(error){
        next(error)
    }
}

var readUsers = async (req, res, next) =>{
    try{
        const result = await userModel.readUsersModel({})
        if(!result) throw new ServerError()
        if(result.length == 0) throw new NotFound("There no data to be shown")
        req.response.message = "Data displayed successfully!"
        req.response.data = result
        res.json(req.response)
    }
    catch(error){
        next(error)
    }
}
 
var readUser = async (req, res, next) =>{
    try{
        const{emp_uid}=req.params
        var [result] = await userModel.readUsersModel({emp_uid})
        
        if(!result) throw new NotFound("There no data to be shown")
        req.response.message = "Data displayed successfully!"
        req.response.data = result
        res.json(req.response)
        
    }catch(error){
        next(error)
    }
}

var updateUser = async (req, res, next) =>{
    const {emp_uid} = req.params
    const updates = Object.keys(req.body)
    const values = Object.values(req.body)
    const allowedUpdates = ["name", "email", "password"]

    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) throw new BadRequest("Please provide valid data!")
    

    const { name, email, password} = req.body
    var hashedPassword = await validateProfile.encryptPassword(req.body.password)
    try {
        var result = await userModel.updateUserModel({emp_uid}, { name, email, password : hashedPassword})
        if(result.affectedRows == 0) throw new NotFound("Data does not exist to update!")
        req.response.message = "Data updated successfully!"
        req.response.data = { name, email, password : hashedPassword}
        res.json(req.response)
    }
    catch(error){
        next(error)
    }
}

var deleteUser = async (req, res, next) => {
    try{
        const{emp_uid}=req.params
        var result = await  userModel.deleteUserModel({emp_uid})
        if(result.affectedRows == 0) throw new NotFound("Data not found to be deleted")
        req.response.message = "Element successfully deleted!"
        res.json(req.response)
    }
    catch(error){
        next(error)
    }
}

module.exports = {
    readUser,
    readUsers,
    registerUser,
    updateUser,
    deleteUser
}