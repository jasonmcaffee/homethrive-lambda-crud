import { StackContext, Api } from "sst/constructs";
import {createTableDefinitions} from "./db/createTableDefinitions";

/**
 * Define the AWS Stack, including database and routes.
 * @param stack - stack provided by sst framework.
 */
export function UserServiceStack({ stack }: StackContext) {
  const [usersTable, userEmailsTable] = createTableDefinitions(stack);

  // Create the API
  const api = new Api(stack, "api", {
    defaults: {
      function: {
        bind: [usersTable, userEmailsTable],
      },
    },
    routes: {
      "POST /users": "packages/functions/src/createUser.handler",
      "GET /users/{userId}": "packages/functions/src/getUser.handler",
      "PUT /users/{userId}": "packages/functions/src/updateUser.handler",
      "DELETE /users/{userId}": "packages/functions/src/deleteUser.handler",
    },
  });

  // Show the API endpoint in the output
  stack.addOutputs({
    ApiEndpoint: api.url,
  });

  return {
    api,
    usersTable,
    userEmailsTable,
  };
}
