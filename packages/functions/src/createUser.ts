import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { DynamoDBDocumentClient, PutCommand, TransactWriteCommand } from "@aws-sdk/lib-dynamodb";
import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { Table } from "sst/node/table";
import { z } from "zod";
import { randomUUID } from "crypto";
export const handler: APIGatewayProxyHandlerV2 = async (event) => {
    console.log("Received request to create user", { event });

    const client = new DynamoDB({});
    const docClient = DynamoDBDocumentClient.from(client);

    const userSchema = z.object({
        name: z.string().min(1),
        dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        emails: z.array(z.string().email()).min(1).max(3),
    });


    let data;
    try {
        data = userSchema.parse(JSON.parse(event.body || "{}"));
    } catch (error) {
        console.warn("Invalid user data", { error });
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "Invalid user data", details: (error as z.ZodError).errors }),
        };
    }

    const userId = randomUUID();
    console.log("Generated new userId", { userId });

    const userItem = {
        userId,
        name: data.name,
        dob: data.dob,
    };

    const emailItems = data.emails.map(email => ({
        userId,
        email,
    }));

    const transactItems = [
        //@ts-ignore
        { Put: { TableName: Table.Users.tableName, Item: userItem } },
        //@ts-ignore
        ...emailItems.map(item => ({ Put: { TableName: Table.UserEmails.tableName, Item: item } })),
    ];

    try {
        console.log("Attempting to create user and emails in DynamoDB", { userId, name: data.name, emailCount: data.emails.length });
        await docClient.send(new TransactWriteCommand({ TransactItems: transactItems }));
        console.log("User and emails created successfully", { userId });

        return {
            statusCode: 201,
            body: JSON.stringify({ ...userItem, emails: data.emails, userId }),
        };
    } catch (error) {
        console.error("Failed to create user", { userId, error: error instanceof Error ? error.message : String(error) });
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Could not create user" }),
        };
    }
};
//
// import { DynamoDBDocumentClient, PutCommand, TransactWriteCommand } from "@aws-sdk/lib-dynamodb";
// import { DynamoDB } from "@aws-sdk/client-dynamodb";
// import { Table } from "sst/node/table";
// import { APIGatewayProxyHandlerV2 } from "aws-lambda";
// // import { StackContext, Table, Api, } from "sst/constructs";
// import { z } from "zod";
// import { randomUUID } from "crypto";
// import { ApiHandler } from "sst/node/api";
//
//
// export const handler = ApiHandler(async (event) => {
//     console.log("Received request to create user", { event });
//
//     const client = new DynamoDB({});
//     const docClient = DynamoDBDocumentClient.from(client);
//
//     const userSchema = z.object({
//         name: z.string().min(1),
//         dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
//         emails: z.array(z.string().email()).min(1).max(3),
//     });
//
//
//     let data;
//     try {
//         data = userSchema.parse(JSON.parse(event.body || "{}"));
//     } catch (error) {
//         console.warn("Invalid user data", { error });
//         return {
//             statusCode: 400,
//             body: JSON.stringify({ error: "Invalid user data", details: (error as z.ZodError).errors }),
//         };
//     }
//
//     const userId = randomUUID();
//     console.log("Generated new userId", { userId });
//
//     const userItem = {
//         userId,
//         name: data.name,
//         dob: data.dob,
//     };
//
//     const emailItems = data.emails.map(email => ({
//         userId,
//         email,
//     }));
//
//     const transactItems = [
//         //@ts-ignore
//         { Put: { TableName: Table.Users.tableName, Item: userItem } },
//         //@ts-ignore
//         ...emailItems.map(item => ({ Put: { TableName: Table.UserEmails.tableName, Item: item } })),
//     ];
//
//     try {
//         console.log("Attempting to create user and emails in DynamoDB", { userId, name: data.name, emailCount: data.emails.length });
//         await docClient.send(new TransactWriteCommand({ TransactItems: transactItems }));
//         console.log("User and emails created successfully", { userId });
//
//         return {
//             statusCode: 201,
//             body: JSON.stringify({ ...userItem, emails: data.emails, userId }),
//         };
//     } catch (error) {
//         console.error("Failed to create user", { userId, error: error instanceof Error ? error.message : String(error) });
//         return {
//             statusCode: 500,
//             body: JSON.stringify({ error: "Could not create user" }),
//         };
//     }
// });
