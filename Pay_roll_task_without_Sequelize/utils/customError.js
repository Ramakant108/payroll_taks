class CustomError extends Error{
    constructor(message,statusCode){
        super(message);
        this.statusCode=statusCode;
    }
}

class  ValidationError extends CustomError{
    constructor(message="validatin Error"){
        super(message,400)
    }
}

class AuthenticationError extends CustomError{
    constructor(message="unautherized"){
        super(message,401)
    }
}

class ForbiddenError extends CustomError{
    constructor(message='forbidenError'){
        super(message,403)
    }
}

class BusinessError extends CustomError{
    constructor(message="something wrong"){
        super(message,400)
    }
}
module.exports= {CustomError,AuthenticationError,ForbiddenError,ValidationError,BusinessError}