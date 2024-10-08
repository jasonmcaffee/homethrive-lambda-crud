import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import {UserService} from "@homethrive-lambda-crud/core/services/UserService";
import {CreateUserRequest} from "@homethrive-lambda-crud/core/models/user";
import {withUserErrorResponseHandling} from "./utils/withUserErrorResponseHandling";
import {ensureHttpMethod} from "./utils/ensureHttpMethod";

/**
 * Create user handler.
 * Expects the request body to match that defined in schema/createUserSchema (firstName, lastName, dob, emails)
 * @param event
 */
export const handler: APIGatewayProxyHandlerV2 = async (event) => {
    return withUserErrorResponseHandling(async ()=> {
        ensureHttpMethod(event, 'POST');
        //parse the json body
        const createUserRequest = JSON.parse(event.body || "{}") as CreateUserRequest

        //create the user service
        const userService = new UserService();

        //create the user
        const user = await userService.createUser(createUserRequest);
        return {
            statusCode: 200,
            body: JSON.stringify(user),
        };
    });
};
