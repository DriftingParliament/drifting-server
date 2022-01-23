class ApiError extends Error {
    constructor(statusCode, message, errorMessage,isOperational = true, stack = '') {
        let msg =message===''?errorMessage:message
        
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.message=msg ;
        this.errorMessage=msg;
        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

module.exports = ApiError;
