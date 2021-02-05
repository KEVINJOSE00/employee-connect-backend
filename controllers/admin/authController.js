const adminModel = require('../../models/adminModel')
const loginModel = require('../../models/loginModel')

const validateProfile = require("../../helpers/authHelper")
const {UnauthorizedRequest, NotAcceptable} = require('../../helpers/errorHelper');


var login = async (req, res, next) => {
    const { body } = req
    try{
        const { email} = req.body
        var [adminDetails] = await adminModel.readEmailModel({email})
        if (!adminDetails) throw new NotAcceptable("Incorrect username");
        
        const isMatch = await validateProfile.verifyCredentials(adminDetails.password, req.body.password)
        if(!isMatch) throw new UnauthorizedRequest("Login Unsuccessfull!")
        
        const {uid : login_uid} = await loginModel.create({user_id : adminDetails.adminId, fcm_id : body.fcm_id})

        let tokenData = {
            user_uid : adminDetails.uid,
            login_uid
        }
        const { token, refresh_token } = await validateProfile.generateToken(tokenData, 1)
        res.setHeader("authorization", true);
        res.setHeader("x-access-token", token);
        res.setHeader("refresh-token", refresh_token);
        delete adminDetails.password;
        delete adminDetails.id;
        req.response.message = "Login Successfull!"
        req.response.data = adminDetails
        res.json(req.response)
    }
    catch(error){
        next(error)
    }
}

var logout = async (req, res, next) =>{
    try{
        const { decoded } = req;
        validateProfile.revokeToken({ jti: decoded.jti });
        loginModel.update({ uid: decoded.jti, data: { status: 'loggedout' } });
        req.response.message = "Loggedout successful";
        res.json(req.response);
    }
    catch(error){
        next(error);
    }
}

module.exports = {
    login,
    logout
}