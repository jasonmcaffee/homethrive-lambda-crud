import {mapUserErrorToResponse} from "../factories/errorResponseFactory";
import {APIGatewayProxyResultV2} from "aws-lambda";

export async function withUserErrorResponseHandling(func:  () => Promise<APIGatewayProxyResultV2>){
    try{
        return await func();
    }catch(e){
        console.error('withUserErrorResponseHandling error: ', e);
        return mapUserErrorToResponse(e);
    }
}
