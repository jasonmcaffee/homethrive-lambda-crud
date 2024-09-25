import {APIGatewayProxyHandlerV2} from "aws-lambda";
import {UserService} from "@homethrive-lambda-crud/core/services/UserService";
import {withUserErrorResponseHandling} from "./utils/withUserErrorResponseHandling";
import {ensureHttpMethod} from "./utils/ensureHttpMethod";

/**
 * Get user handler.
 * Expects the request path to include the user id.
 * @param event
 */
export const handler: APIGatewayProxyHandlerV2 = async (event) => {
    return withUserErrorResponseHandling(async () => {
        ensureHttpMethod(event, 'GET');
        const userId = event.pathParameters?.userId;

        //create the user service
        const userService = new UserService();

        //create the user
        const user = await userService.getUser(userId);
        return {
            statusCode: 200,
            body: JSON.stringify(user),
        };
    })
};
