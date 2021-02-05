const { customAlphabet } = require("nanoid");
const nanoid = customAlphabet(
    "abcdefghijklmnopqrstuvwxyzABCEFGHIJKLMNOPQRSTUVWXYZ123456789",
    20
);
const utilsHelper = {}


utilsHelper.uniqueId = (prefix) => {
    if (prefix) {
        return `${prefix}_${nanoid()}`;
    } else {
        return nanoid();
    }
};

module.exports = utilsHelper