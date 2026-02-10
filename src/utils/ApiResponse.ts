class ApiResponse {
    success: boolean
    data: Object
    error: null
    constructor(statusCode:number, data :Object){
        this.success = statusCode<400
        this.data = data
        this.error = null
    }
}

export {ApiResponse}