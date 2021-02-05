const userModel = require('../../models/userModel')
const validateProfile = require("../../helpers/authHelper")
const {UnauthorizedRequest, NotFound} = require('../../helpers/errorHelper');


var login = async (req, res, next) => {
    const { email, password} = req.body
    try{
        var [result] = await userModel.readUsersModel({ email, password})
        var EmailAlreadyExist = await userModel.countUserModel({email})
        if(EmailAlreadyExist != 1) throw new NotFound("Email does not exist!")
        const isMatch = await validateProfile.verifyCredentials(result.password, req.body.password)
        
        if(!isMatch) throw new UnauthorizedRequest("The email or password provided is invalid!")
        
        var mailId = result.email
        var username = result.name
        req.response.message = "Login successfull!"
        req.response.data = {mailId, username}
        res.json(req.response)
    }
    catch(error){
        next(error)
    }
}

module.exports = {
    login
}