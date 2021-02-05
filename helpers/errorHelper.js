class ServerError extends Error {
    constructor(message) {
        super(message);
        this.message = "Internal Server error";
        this.name = "Internal Server error";
        this.code = 500;
    }
}

exports.ServerError = ServerError;

class BadRequest extends Error {
    constructor(message) {
        super(message);
        this.message = message || "Bad Request";
        this.name = "Bad Request";
        this.code = 400;
    }
}

exports.BadRequest = BadRequest;

class UnauthorizedRequest extends Error {
    constructor(message, name = "Unauthorized Request") {
        super(message);
        this.message = message || "Unauthorized Request";
        this.name = name;
        this.code = 401;
    }
}

exports.UnauthorizedRequest = UnauthorizedRequest;

class NotFound extends Error {
    constructor(message) {
        super(message);
        this.message = message || "Not Found";
        this.name = "Not Found";
        this.code = 404;
    }
}

exports.NotFound = NotFound;

class Forbidden extends Error {
    constructor(message) {
        super(message);
        this.message = message || "Forbidden";
        this.name = "Forbidden";
        this.code = 403;
    }
}

exports.Forbidden = Forbidden;

class NotAcceptable extends Error {
    constructor(message) {
        super(message);
        this.message = message || "Not Acceptable";
        this.name = "Not Acceptable";
        this.code = 406;
    }
}

exports.NotAcceptable = NotAcceptable;