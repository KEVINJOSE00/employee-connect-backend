const fs = require("fs");
const moment = require('moment');
const { Console } = console;
let logger = {
    info: info,
    error: error
};

function info(data) {
    const date = moment().format('YYYY-MM-DD');
    const dir = `./logs/${date}_info_log.txt`;
    console.log(data);
    const border = "\n=================== INFO =====================\n";
    new Console(fs.createWriteStream(dir, { flags: 'a' })).log(border, data);
}

function error(data) {
    console.log(data)
    const date = moment().format('YYYY-MM-DD');
    const dir = `./logs/${date}_error_log.txt`;
    console.log(dir)
    console.error(data);
    const border = "\n=================== ERROR =====================\n";
    new Console(fs.createWriteStream(dir, { flags: 'a' })).error(border, data);
}

module.exports = logger;