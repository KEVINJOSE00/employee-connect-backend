const utilsHelper = require('../helpers/utilsHelper');
const DB = require('../server/database_');
const config = require('../server/config');

const loginModel = {};

loginModel.create = async ({
    user_id,
    fcm_id = null,
    status = 'active',
}) => {
    try {
        const data = {
            uid: utilsHelper.uniqueId("login"),
            user_id,
            fcm_id,
            status
        }
        const result = await DB.insert("logins", data);
        return { id: result.insertId, uid: data.uid };
    } catch (error) {
        throw error;
    }
}

loginModel.read = async ({ user_id, uid }) => {
    try {
        const conds = {};
        if (user_id) {
            conds['user_id'] = user_id;
        } else if (uid) {
            conds['uid'] = uid;
        }
        return await DB.get("logins", conds);
    } catch (error) {
        throw error;
    }
}

loginModel.update = async ({ user_id, uid, data }) => {
    try {
        const conds = {};
        if (user_id) {
            conds['user_id'] = user_id;
        } else if (uid) {
            conds['uid'] = uid;
        }
        return await DB.update("logins", data, conds);
    } catch (error) {
        throw error;
    }
}

module.exports = loginModel;