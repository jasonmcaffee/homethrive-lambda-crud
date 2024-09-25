import {HTTPMethodNotAllowed, InvalidRequestError, UserNotFoundError} from "@homethrive-lambda-crud/core/models/errors";

export function mapUserErrorToResponse(e: any){
    if(e instanceof InvalidRequestError){
        return {
            statusCode: 400,
            body: JSON.stringify(e),
        };
    } else if(e instanceof UserNotFoundError){
        return {
            statusCode: 404,
            body: JSON.stringify(e),
        };
    } else if(e instanceof HTTPMethodNotAllowed){
        return {
            statusCode: 405,  // Method Not Allowed
            body: JSON.stringify(e),
        };
    }
    return {
        statusCode: 500,
        body: JSON.stringify({ error: "Error encountered" }),
    };
}
