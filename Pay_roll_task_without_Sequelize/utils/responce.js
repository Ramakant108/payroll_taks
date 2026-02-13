
class Responce{
    constructor(statusCode,message,data){
        this.statusCode=statusCode
        this.message=message,
        this.data=data
    }

    static created(message,data){
        return new Responce(201,message,data);
    }

    static ok(message,data){
        return new Responce(200,message,data);
    }
}

module.exports=Responce