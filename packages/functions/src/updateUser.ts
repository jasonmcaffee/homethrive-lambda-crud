import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import {UserService} from "@homethrive-lambda-crud/core/services/UserService";
import {UpdateUserRequest, User} from "@homethrive-lambda-crud/core/models/user";
import {withUserErrorResponseHandling} from "./utils/withUserErrorResponseHandling";
import {InvalidRequestError} from "@homethrive-lambda-crud/core/models/errors";
import {ensureHttpMethod} from "./utils/ensureHttpMethod";

/**
 * Update user handler.
 * Expects the request body to match that defined in schema/updateUserSchema (userId, firstName, lastName, dob, emails)
 * @param event
 */
export const handler: APIGatewayProxyHandlerV2 = async (event) => {
    return withUserErrorResponseHandling(async () => {
        ensureHttpMethod(event, 'PUT');
        const userId = event.pathParameters?.userId;
        //parse the json body
        const parsedBody = JSON.parse(event.body || "{}");
        const updateUserRequest: UpdateUserRequest = {
            ...parsedBody,
            userId
        };

        //create the user service
        const userService = new UserService();

        //create the user
        const user = await userService.updateUser(updateUserRequest);
        return {
            statusCode: 200,
            body: JSON.stringify(user),
        };
    });
};
