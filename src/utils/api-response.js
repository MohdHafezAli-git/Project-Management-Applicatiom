class ApiResponse{
    constructor(statusCode , data , messages = "success"){
        this.statusCode = statusCode
        this.data = data
        this.messages = messages
        this.success = statusCode < 400
    }
}

export {ApiResponse}