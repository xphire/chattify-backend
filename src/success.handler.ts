export default function successHandler(message : string, statusCode: number , data? : Record<string,any>){

    return {
        message,statusCode,data
    }

}