const database = require('../server/database_')
const utilHelper=require("../helpers/utilsHelper.js")


var createAdminModel =  async ({firstName, lastName, email, designation, img,  password}) =>{
    const result = await database.insert("Employee", {firstName, lastName, email, designation, img, password, uid:utilHelper.uniqueId('emp')})
    return result
}

var readAdminModel = async({emp_uid=null, includeId=false}) => {
    let sql=`SELECT 
    e.firstName
    ,e.lastName 
    ,e.password
    ,e.email
    ,e.designation
    ,e.img
    ,e.uid
    ${includeId ? ",e.id" : ""}
    FROM Employee e
    WHERE 1`;
    let array=[];
if (emp_uid){
    sql+=` AND e.uid=?  `
    array.push(emp_uid)
}
const result =await database.selectQuery(sql,array)
return result
    
}
var updateAdminModel = async ({emp_uid}, { firstName, lastName, email, designation, img, password}) =>{
    const result = await database.update( "Employee", {firstName, lastName, email, designation, img, password}, {uid : emp_uid})
    return result
}

var deleteAdminModel = async ({emp_uid}) =>{
    const result = await database.delete_row("Employee", {uid:emp_uid})
    return result 
}

var countAdminModel = async ({name, email, password = null}) =>{
    const result = await database.getCount("Employee", {email})
    return result
}

var readEmailModel = async({email}) => {
    let sql=`SELECT 
    e.id
    ,e.firstName
    ,e.lastName 
    ,e.password,
    e.email,
    e.designation
    ,e.uid
    FROM Employee e
    WHERE 1`;
    let array=[];
 if (email){
     console.log("hello")
    sql+=` AND e.email=?  `
   array.push(email)
}
const result =await database.selectQuery(sql,array)
return result
    
}

module.exports = {
    createAdminModel,
    readAdminModel,
    updateAdminModel,
    deleteAdminModel,
    countAdminModel,
    readEmailModel
}

