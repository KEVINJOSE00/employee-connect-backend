const config = require('../server/config')
var validator = require("email-validator");
var bcrypt = require('bcrypt');
const moment = require("moment");
const jwt = require("jsonwebtoken");
const { jwt_secret } = require('../server/config');
const loginModel = require('../models/loginModel');
const redisHelper = require("./redisHelper");
const {ServerError, BadRequest, Forbidden, UnauthorizedRequest,} = require('./errorHelper');
const bodyParser = require("body-parser");


const validateUserProfile = async (req, res, next) => {
    console.log(typeof(req.body.firstName))
    if(validator.validate(req.body.email) && typeof(req.body.firstName) == "string" && typeof(req.body.lastName) == "string" && req.body.password.length >= 6)
    {
        next()
    }
    else{   
        res.status(400).send({error : 'please provide credentials'})
    console.log("HII")

  }
}

const encryptPassword = async (password) => {
    return new Promise(function (resolve, reject) {
        try{
            let hash = bcrypt.hash(password, 10)
            resolve(hash)
        }
        catch(error){
            reject(error)
        }
    })
}

const verifyCredentials = async (correctPassword, password) => {
    return new Promise(function (resolve, reject){
        try{
            const isMatch = bcrypt.compare(password, correctPassword)
            resolve(isMatch)
        }
        catch(error) {
            reject(error)
        }
    })
}

const generateToken = async (payload, ttl = 30) => {
    return new Promise((resolve, reject) => {
      try {
        var data = {};
        Object.keys(payload).forEach((key) => {
          if (key == "user_uid" || key == "login_uid")
            data[key] = payload[key];
        });
        
        let auths = {};
        var token = jwt.sign(data, config.jwt_secret, {
          expiresIn: `${ttl}d`,
          jwtid: data["login_uid"] ? data["login_uid"].toString() : "1",
        });

        var refresh_token = jwt.sign(data, config.jwt_secret, {
          expiresIn: "90d",
          jwtid: data["login_uid"] ? data["login_uid"].toString() : "1",
        });
        auths.token = token;
        auths.refresh_token = refresh_token;
        resolve(auths);
      } catch (error) {
        reject(error);
      }
    });
}

var validateToken = (req, res, next) => {
  try {
      console.log("hi from validate token")
      var token = req.headers["x-access-token"];
      var refresh_token = req.headers["refresh-token"];
      console.log(token,"tokendata")
      if (token || refresh_token) {
      jwt.verify(token, config.jwt_secret, async function (err, decoded) {
          console.log("decoded",decoded)
          if (err) {
              if (refresh_token) {
                  jwt.verify(refresh_token, config.jwt_secret, async function (
                      err,
                      decoded
                  ) {
                      if (err) {
                          res.setHeader("authorization", false);
                          req.response.invalidToken = true;
                          jwt.verify(
                              token,
                              config.jwt_secret,
                              { ignoreExpiration: true },
                              async (err, decoded) => {
                                  if (decoded) {
                                      await loginModel.update({
                                          data: { status: 'expired' },
                                          uid: decoded.jti,
                                      });
                                  }
                              }
                          );
                          next(new UnauthorizedRequest("Authentication failed"));
                      } else {
                          req.decoded = decoded;
                          let isBlackListed = await redisHelper.isBlackListed({
                              jti: decoded.jti,
                          });
                          if (!isBlackListed) {
                              var user_info = { user_uid: decoded.user_uid, login_uid: decoded.login_uid };
                              var newtoken = jwt.sign(user_info, config.jwt_secret, {
                                  expiresIn: "1d",
                              });
                              res.setHeader("authorization", true);
                              res.setHeader("x-access-token", newtoken);
                              next();
                          } else {
                              res.setHeader("authorization", false);
                              req.response.invalidToken = true;
                              next(new UnauthorizedRequest("Session expired"));
                          }
                      }
                  });
              } else {
                  res.setHeader("authorization", false);
                  req.response.invalidToken = true;
                  next(new UnauthorizedRequest("Authentication failed"));
              }
          } else {
              let isBlackListed = await redisHelper.isBlackListed({
                  jti: decoded.jti,
              });
              if (!isBlackListed) {
                  res.setHeader("authorization", true);
                  req.decoded = decoded;
                  next();
              } else {
                  next(new UnauthorizedRequest("Session expied"));
              }
          }
      })
     

      }
      else {

          res.setHeader("authorization", false);
          req.response.invalidToken = true;
          next(new UnauthorizedRequest("Authentication failed"));
      }}
  catch (error) {
      next(error);
  }
}

const logout = async (req, res, next) => {
  try {
    let jwtToken = req.headers["x-access-token"];
    let RefreshToken = req.headers["refresh-token"];
    var authDecoded = jwt.verify(jwtToken, config.jwt_secret);
    var refreshDecoded = jwt.verify(RefreshToken, config.jwt_secret);

    if (
      authDecoded.jti &&
      authDecoded.exp &&
      refreshDecoded.jti &&
      refreshDecoded.exp
    ) {
      const authExp = new Date(authDecoded.exp * 1000);
      authExp.setHours(23, 59, 59, 999);

      const auth_redis_expiry =
        (authExp.getTime() - new Date().getTime()) / 1000;

      const authKey = moment(authExp).format("DDMMYYYY");

      const refreshExp = new Date(refreshDecoded.exp * 1000);
      refreshExp.setHours(23, 59, 59, 999);
      const refresh_redis_expiry =
        (refreshExp.getTime() - new Date().getTime()) / 1000;
      const refreshKey = moment(refreshExp).format("DDMMYYYY");

      Promise.all([
        redisHelper.addToRedisBlackList({
          key: authKey,
          jti: authDecoded.jti,
          redis_expiry_at: Math.floor(auth_redis_expiry),
        }),
        redisHelper.addToRedisBlackList({
          key: refreshKey,
          jti: refreshDecoded.jti,
          redis_expiry_at: Math.floor(refresh_redis_expiry),
        }),
      ])
        .then((response) => {
          next();
        })
        .catch((err) => {
          console.log(err);
          res.header("authentication", "false");
          res.status(401).send({
            status: false,
            message: "Failed to authenticate token.",
            invalidToken: true,
          });
        });
    } else {
      res.header("authentication", "false");
      res.status(401).send({
        status: false,
        message: "Failed to authenticate token.",
        invalidToken: true,
      });
    }
  } catch (e) {
    console.log(e);
    if (e.name && e.name === "TokenExpiredError") {
      try {
        let RefreshToken = req.headers["refresh-token"];
        var refreshDecoded = jwt.verify(RefreshToken, config.jwt_secret);

        if (refreshDecoded.jti && refreshDecoded.exp) {
          const refreshExp = new Date(refreshDecoded.exp * 1000);
          refreshExp.setHours(23, 59, 59, 999);
          const refresh_redis_expiry =
            (refreshExp.getTime() - new Date().getTime()) / 1000;
          const refreshKey = moment(refreshExp).format("DDMMYYYY");

          redisHelper
            .addToRedisBlackList({
              key: refreshKey,
              jti: refreshDecoded.jti,
              redis_expiry_at: Math.floor(refresh_redis_expiry),
            })
            .then((response) => {
              next();
            })
            .catch((err) => {
              console.log(err);
              res.header("authentication", "false");
              res.status(401).send({
                status: false,
                message: "Failed to authenticate token.",
                invalidToken: true,
              });
            });
        }
      } catch (error) {
        console.log("e", error);
        res.header("authentication", "false");
        let response = {
          status: false,
          message: "Failed to authenticate token.",
          invalidToken: true,
        };
        res.status(401).send(response);
      }
    }
  }
}

const revokeToken = ({ jti }) => {
  const curDate = moment();
  const exp = curDate.clone().add(30, "days");
  exp
    .set("hours", 23)
    .set("minutes", 59)
    .set("seconds", 59)
    .set("milliseconds", 999);
  const redis_expiry = exp.get("milliseconds") - curDate.get("milliseconds");
  const key = moment(exp).format("DDMMYYYY");
  return redisHelper.addToRedisBlackList({
    key,
    jti: jti,
    redis_expiry_at: Math.floor(redis_expiry),
  });
}

var removeSession = async (req, res, next) => {
  try {
  const { decoded } = req;
  authHelper.revokeToken({ jti: decoded.jti });
  loginModel.update({ uid: decoded.jti, data: { status: 'loggedout' } });
  req.response.message = "Logout successfully";
  res.json(req.response);
  } catch (error) {
  next(error);
  }
  }

module.exports = { 
    validateUserProfile,
    encryptPassword, 
    verifyCredentials,
    generateToken,
    validateToken,
    logout,
    revokeToken,
    removeSession
}
