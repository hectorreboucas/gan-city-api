class AppException extends Error {
    constructor(status, message){
        super(message);
        this.status = status;
    }
}

class NotFound extends AppException {
    constructor(message){
        super(404, message);
    }
}

class Unauthorized extends AppException {
    constructor(message){
        super(401, message);
    }
}

module.exports = {
    NotFound,
    Unauthorized,
    AppException
}