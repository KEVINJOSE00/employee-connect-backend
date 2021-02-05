const config = require('../server/config')
const jwt = require("jsonwebtoken");

const generateMessage = (text, acess) => {
    jwt.verify(acess, config.jwt_secret, async function (err, decoded) {
        if (decoded) {
          uid = decoded.user_uid
        }
    })
    return {
        text,
        createdAt: new Date().getTime(),
        user_id: uid
    }
}


const newMessage = (msg, reciever, acess) =>{
    jwt.verify(acess, config.jwt_secret, async function (err, decoded) {
        if (decoded) {
          uid = decoded.user_uid
        }
    })
    return {
        msg, 
        reciever,
        sender : uid,
        createdAt :  new Date().getTime()
    }
}



module.exports = {
    generateMessage,
    newMessage
}




