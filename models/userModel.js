const database = require('../server/database_')
const utilHelper=require("../helpers/utilsHelper.js")


var createUserModel =  async ({name, email, password}) =>{
    const result = await database.insert("user", {name, email, password, uid:utilHelper.uniqueId('emp')})
    return result
}

var readUsersModel = async({emp_uid=null}) => {
    let sql=`SELECT 
    e.email
    ,e.name 
    ,e.password
    ,e.uid
    FROM user e
    WHERE 1`;
    let array=[];
if (emp_uid){
    sql+=` AND e.uid=?  `
    array.push(emp_uid)
}
console.log(sql)
const result =await database.selectQuery(sql,array)
return result
    
}
var updateUserModel = async ({emp_uid}, { name, email, password}) =>{
    const result = await database.update( "user", { name, email, password}, {uid : emp_uid})
    return result
}

var deleteUserModel = async ({emp_uid}) =>{
    const result = await database.delete_row("user", {uid:emp_uid})
    return result 
}

var countUserModel = async ({name, email, password}) =>{
    const result = await database.getCount("user", {email})
}



module.exports = {
    createUserModel,
    readUsersModel,
    updateUserModel,
    deleteUserModel,
    countUserModel
}

