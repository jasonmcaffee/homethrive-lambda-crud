import {APIGatewayProxyEventV2} from "aws-lambda";
import {HTTPMethodNotAllowed} from "@homethrive-lambda-crud/core/models/errors";

/**
 * Helper function for lambda functions to validate http methods
 * @param event - proxy event with actual http method
 * @param desiredMethod - desired method
 */
export function ensureHttpMethod(event: APIGatewayProxyEventV2, desiredMethod: string){
    if(event.requestContext.http.method !== desiredMethod){
        throw new HTTPMethodNotAllowed(`This endpoint only supports the ${desiredMethod} method`);
    }
}
