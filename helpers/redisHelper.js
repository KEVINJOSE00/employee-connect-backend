const redisLib = require("redis");
const {
  BadRequest,
  ServerError,
  UnauthorizedRequest,
  Forbidden,
} = require("./errorHelper");

const redis = {};

const redisClient = redisLib.createClient();

redisClient.on("connect", () => {
  console.log("Redis client connected");
});
redisClient.on("error", (error) => {
  console.log("Redis not connected", error);
});

redis.addToRedisBlackList = ({ key, jti, redis_expiry_at }) => {
  return new Promise((resolve, reject) => {
    addToList({ key: "keyList", value: key })
      .then(addToList({ key, value: jti }))
      .then(addExpireAt({ key, expireat: redis_expiry_at }))
      .then(resolve(true))
      .catch((err) => reject());
  });
};

redis.isBlackListed = async ({ jti }) => {
  try {
    if (!jti) return true;
      let keys = await getListMembers({ key: "keyList" });
      let valueIndex = -1;
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        try {
          var jtis = await getListMembers({ key });
          valueIndex = jtis.indexOf(jti);
          if (valueIndex > -1) break;
        } catch (error) {
          console.log("error=>>", error);
          return true;
        }
      }
      if (valueIndex > -1) return true;
      return false;
      
  } catch (error) {
    throw error;
  }
};

function addToList({ key, value }) {
  return new Promise((resolve, reject) => {
    redisClient.sadd(key, value, (err, reply) => {
      if (err) reject(err);
      resolve(reply);
    });
  });
}

function getListMembers({ key }) {
  return new Promise((resolve, reject) => {
    redisClient.smembers(key, (err, replies) => {
      if (err) reject(err);
      resolve(replies);
    });
  });
}

function addExpireAt({ key, expireat }) {
  return new Promise((resolve, reject) => {
    redisClient.expire(key, +expireat, (err, reply) => {
      if (err) reject(err);
      resolve(reply);
    });
  });
}

module.exports = redis;