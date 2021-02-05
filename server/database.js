const con = require("../server/databaseConnection")


var database = {
    create : function (data, dbName, callback){
        
        var keys = Object.keys(data)
        var sqlNames = keys.toString()
       
        var values = Object.values(data)
       
        var finalValues = ""
        
        for(i of values){
            finalValues += '"' + i + '"'  + ',' 
        }
       
        finalValues = finalValues.substring(0, finalValues.length - 1);
        
        var sql = `INSERT ${dbName} (${sqlNames}) VALUES (${finalValues})`;
        con.query(sql, function (err, result) {
            if (err){   
                throw err;  
              }  
            return callback(result); 
        });
    },
    read : function (dbName, callback){
        
        con.query(`SELECT * FROM ${dbName}`, function (err, result, fields) {
            if (err){   
                throw err;  
              }  
            return callback(result);  
        });
    },
    readSingle : function (id, dbName, callback){
        
        con.query(`SELECT * FROM ${dbName} WHERE userId = '${id}'`, function (err, result, fields) {
            if (err){   
                throw err;  
              }  
              
            return callback(result);  
        });
    },
    update : function (id, updates, values, dbName, callback){

        var sqlPartOne  = "UPDATE " + dbName  
        var sqlPartTwo =  " SET "
        var sqlPartFour =  " WHERE"
        var sqlPartFive = " userId = " + id + " "
        var sqlPartThree = ""
        for(i=0; i<updates.length; i++){
            sqlPartThree += updates[i]+ " = " + '"' + values[i] + '"' + ","
        }
        
        sqlPartThree = sqlPartThree.substring(0, sqlPartThree.length - 1);
        finalString = sqlPartOne + sqlPartTwo + sqlPartThree + sqlPartFour + sqlPartFive
        
         con.query(finalString, function (err, result, fields) {
                 if (err){   
                    throw err;  
                  }  
                  return callback(result);  
            });
    },
    delete : function (id, dbName, callback){
        
        con.query(`DELETE FROM ${dbName} WHERE userId = '${id}'`, function (err, result, fields) {
            if (err){   
                throw err;  
              }  
              
            return callback(result); 
        });
    }
}




module.exports = database