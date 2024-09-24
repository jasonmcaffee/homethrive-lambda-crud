import { StackContext, Table, Api } from "sst/constructs";

export function UserServiceStack({ stack }: StackContext) {
  // Create the DynamoDB table
  const usersTable = new Table(stack, "Users", {
    fields: {
      userId: "string",
      name: "string",
      dob: "string",
    },
    primaryIndex: { partitionKey: "userId" },
  });

  const userEmailsTable = new Table(stack, "UserEmails", {
    fields: {
      userId: "string",
      email: "string",
    },
    primaryIndex: { partitionKey: "userId", sortKey: "email"},
  });

  // Create the API
  const api = new Api(stack, "api", {
    defaults: {
      function: {
        bind: [usersTable, userEmailsTable],
      },
    },
    routes: {
      "POST /users": "packages/functions/src/createUser.handler",
      // "GET /users/{userId}": "functions/src/getUser.handler",
      // "PUT /users/{userId}": "functions/src/updateUser.handler",
      // "DELETE /users/{userId}": "functions/src/deleteUser.handler",
      // "POST /users/{userId}/emails": "functions/src/addUserEmail.handler",
      // "GET /users/{userId}/emails": "functions/src/getUserEmail.handler",
    },
  });

  // Show the API endpoint in the output
  stack.addOutputs({
    ApiEndpoint: api.url,
  });

  return {
    api,
    usersTable,
    usersEmailTable: userEmailsTable,
  };
}
