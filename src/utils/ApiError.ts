class ApiError {
    success: boolean
    data: null
    error: String

    constructor(statusCode:number, error:String){
        this.success = statusCode<400
        this.data = null
        this.error = error
    }
}

export {ApiError}