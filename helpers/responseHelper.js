var responseHelper = {};

responseHelper.setReponse = (req, res, next) => {
    var function_name = req.url.split("?");
    req.response = {
        function: function_name[0].replace("/", ""),
        message: "",
        data: {}
    };
    res.setHeader("authorization", true);
    res.setHeader("x-access-token", "");
    res.setHeader("refresh-token", "");
    next();
};

module.exports = responseHelper;