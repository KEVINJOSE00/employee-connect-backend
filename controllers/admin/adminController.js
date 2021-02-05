const adminModel = require('../../models/adminModel')
const loginModel = require('../../models/loginModel')
const io = require('../../helpers/socketHelper')

const {BadRequest, NotFound, NotAcceptable, ServerError} = require('../../helpers/errorHelper');
const validateProfile = require("../../helpers/authHelper")

var registerAdmin = async (req, res, next) => {
    const { firstName, lastName, email, designation, img,  password} = req.body
    try{
        var hashedPassword = await validateProfile.encryptPassword(req.body.password)
        var EmailAlreadyExist = await adminModel.countAdminModel({email})
        if(EmailAlreadyExist > 0) throw new NotAcceptable("The email already exist!")

        var result = await adminModel.createAdminModel({firstName, lastName, email, designation, img, password: hashedPassword})
        if(result.affectedRows == 0) throw new ServerError();
        var [adminDetails] = await adminModel.readEmailModel({email})
        const {uid : login_uid} = await loginModel.create({user_id : adminDetails.id, fcm_id : req.body.fcm_id})
        let tokenData = {
            user_uid : adminDetails.uid,
            login_uid
        }
        const { token, refresh_token } = await validateProfile.generateToken(tokenData, 1)
        res.setHeader("authorization", true);
        res.setHeader("x-access-token", token);
        res.setHeader("refresh-token", refresh_token);
        req.response.message = "Data inserted successfully!"
        req.response.data = req.body
        res.json(req.response)
    }catch(error){
        next(error)
    }
}

var readAdmins = async (req, res, next) =>{
    try{
        const result = await adminModel.readAdminModel({})
        if(!result) throw new ServerError()
        // if(result.length == 0) throw new NotFound("There no data to be shown")
        req.response.message = "Data displayed successfully!"
        req.response.data = result
        res.json(req.response)
    }
    catch(error){
        next(error)
    }
}
 
var readAdmin = async (req, res, next) =>{
    try{
        const{emp_uid}=req.params
        var [result] = await adminModel.readAdminModel({emp_uid})
        if(!result) throw new NotFound("There no data to be shown")
        req.response.message = "Data displayed successfully!"
        req.response.data = result
        res.json(req.response)
    }catch(error){
        next(error)
    }
}

var updateAdmin = async (req, res, next) =>{
    const {emp_uid} = req.params
    const updates = Object.keys(req.body)
    const allowedUpdates = ["firstName", "lastName", "email", "designation", "password", "img"]

    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) throw new BadRequest("Please provide valid data!")
    
    const {firstName, lastName, email, designation, img, password} = req.body
    var hashedPassword = await validateProfile.encryptPassword(req.body.password)
    try {
        var result = await adminModel.updateAdminModel({emp_uid}, { firstName, lastName, email, designation, img, password : hashedPassword})
        if(result.affectedRows == 0) throw new NotFound("Data does not exist to update!")
        req.response.message = "Data updated successfully!"
        req.response.data = { firstName, lastName, email, designation, img, password : hashedPassword}
        res.json(req.response)
    }
    catch(error){
        next(error)
    }
}

var deleteAdmin = async (req, res, next) => {
    try{
        const{emp_uid}=req.params
        var result = await  adminModel.deleteAdminModel({emp_uid})
        if(result.affectedRows == 0) throw new NotFound("Data not found to be deleted")
        req.response.message = "Element successfully deleted!"
        res.json(req.response)
    }
    catch(error){
        next(error)
    }
}

module.exports = {
    registerAdmin,
    readAdmins,
    readAdmin,
    updateAdmin,
    deleteAdmin
}