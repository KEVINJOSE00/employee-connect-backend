var mysql = require("mysql");
var crypto = require("crypto");
var nodemailer = require("nodemailer");
var merge = require("merge");
var fs = require("fs");
var jwt = require("jsonwebtoken");
var connectionProvider = require("./db_connection");

var database = {
  get: function (table, cond) {
    var self = this;
    return new Promise(function (resolve, reject) {
      try {
        var sql = "SELECT * FROM " + table;
        let data = [];
        if (typeof cond == "object") {
          sql += " WHERE 1";
          // for (var key in cond) {
          // 	sql += " AND ";
          // 	sql += key + " = '" + cond[key] + "'";
          // }
          for (var key in cond) {
            data.push(cond[key]);
            sql += " AND ";
            sql += key + " = ?";
          }
        }
         console.log(sql);
        self
          .selectQuery(sql, data)
          .then(
            (result) => resolve(result),
            (error) => reject(error)
          )
          .catch((err) => {
            reject(err);
          });
      } catch (error) {
        reject(error);
      }
    });
  },
  getCount: function (table, cond) {
    var self = this;
    return new Promise(function (resolve, reject) {
      try {
        let data = [];
        var sql = "SELECT count(*) as cnt FROM " + table;
        if (typeof cond == "object") {
          sql += " WHERE 1";
          for (var key in cond) {
            data.push(cond[key]);
            sql += " AND ";
            sql += key + " = ?";
          }
        }
        self
          .selectQuery(sql, data)
          .then(
            (result) => resolve(result[0]["cnt"]),
            (error) => reject(error)
          )
          .catch((err) => {
            reject(err);
          });
      } catch (error) {
        reject(error);
      }
    });
  },
  insert: function (table, data) {
    var self = this;
    return new Promise(function (resolve, reject) {
      try {
        var sql = "INSERT INTO " + table + " SET ?";
        if (typeof data == "object") {
          self
            .processQuery(sql, data)
            .then(
              (result) => resolve(result),
              (error) => reject(error)
            )
            .catch((err) => {
              reject(err);
            });
        } else {
          reject(new Error("data not an object"));
        }
      } catch (error) {
        reject(error);
      }
    });
  },
  bulk_insert: function (table, keys, data) {
    var self = this;
    return new Promise(function (resolve, reject) {
      var sql = "INSERT INTO " + table + " " + keys + " VALUES ?";
      let params = [data];
      self
        .processQuery(sql, params)
        .then(
          (result) => resolve(result),
          (error) => reject(error)
        )
        .catch((err) => {
          reject(err);
        });
    });
  },
  update: function (table, fields, cond) {
    var self = this;
    return new Promise(function (resolve, reject) {
      try {
        var sql = "UPDATE " + table + " SET ";
        for (var key in fields) {
          // console.log(key);
          sql += key + " = ?,";
        }
        sql = sql.substring(0, sql.length - 1) + " WHERE ";

        for (var ky in cond) {
          sql += ky + " = ? AND ";
        }

        sql = sql.substring(0, sql.length - 4);
        var original = merge(fields, cond);
        var data = [];
        for (var attr in original) {
          // console.log(original[attr]);
          data.push(original[attr]);
        }
        self
          .processQuery(sql, data)
          .then(
            (result) => resolve(result),
            (error) => reject(error)
          )
          .catch((err) => {
            reject(err);
          });
      } catch (error) {
        reject(error);
      }
    });
  },
  delete_row: function (table, cond) {
    var self = this;
    return new Promise(function (resolve, reject) {
      try {
        var sql = "delete  FROM " + table;
        var data = [];
        if (typeof cond == "object") {
          sql += " WHERE 1 ";
          for (var key in cond) {
            data.push(cond[key]);
            sql += " AND ";
            sql += key + " = ?";
          }
        }
        self
          .selectQuery(sql, data)
          .then(
            (result) => resolve(result),
            (error) => reject(error)
          )
          .catch((err) => {
            reject(err);
          });
      } catch (error) {
        reject(error);
      }
    });
  },
  selectQuery: function (sql, data) {
    return new Promise(function (resolve, reject) {
      try {
        if (data.length > 0) {
          connectionProvider.dbConnectionProvider.getConnection(
            (err, connection) => {
              if (!err) {
                connection.query(sql, data, function (err, result) {
                  if (err) {
                    reject(err);
                  }
                  connection.release();
                  resolve(result);
                });
              } else {
                reject(err);
              }
            }
          );
        } else {
          connectionProvider.dbConnectionProvider.getConnection(
            (err, connection) => {
              if (!err) {
                connection.query(sql, function (err, result) {
                  if (err) {
                    reject(err);
                  }
                  connection.release();
                  resolve(result);
                });
              } else {
                reject(err);
              }
            }
          );
        }
      } catch (error) {
        reject(error);
      }
    });
  },
  processQuery: function (sql, data) {
    return new Promise(function (resolve, reject) {
      try {
        connectionProvider.dbConnectionProvider.getConnection(
          (err, connection) => {
            if (!err) {
              connection.query(sql, data, function (err, result) {
                if (err) {
                  reject(err);
                }
                connection.release();
                resolve(result);
              });
            }
          }
        );
      } catch (error) {
        reject(error);
      }
    });
  },
};

module.exports = database;