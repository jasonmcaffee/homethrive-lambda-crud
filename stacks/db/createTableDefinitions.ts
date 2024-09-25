import {Stack, Table} from "sst/constructs";

export function createTableDefinitions(stack: Stack){
    const usersTable = new Table(stack, "Users", {
        fields: {
            userId: "string",
            firstName: "string",
            lastName: "string",
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

    return [usersTable, userEmailsTable];
}
