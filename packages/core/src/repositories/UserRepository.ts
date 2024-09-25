import {DynamoDBDocumentClient, GetCommand, QueryCommand, TransactWriteCommand} from "@aws-sdk/lib-dynamodb";
import {User, CreateUserRequest, UpdateUserRequest} from "@homethrive-lambda-crud/core/models/user";
import {randomUUID} from "crypto";
import {Table} from "sst/node/table";
import {UserNotFoundError} from "@homethrive-lambda-crud/core/models/errors";
import {DynamoDB} from "@aws-sdk/client-dynamodb";

/**
 * Repository to simplify and abstract away db implementations.
 */
export class UserRepository{
    private docClient: DynamoDBDocumentClient;

    constructor(docClient: DynamoDBDocumentClient = DynamoDBDocumentClient.from(new DynamoDB({}))) {
        this.docClient = docClient;
    }

    /**
     * Inserts into Users and UserEmails tables.
     * Returns the unique id for the newly created user
     * @param userData - data needed to create the user.
     */
    async createUser(userData: CreateUserRequest): Promise<string> {
        //create items to put into the db.
        const userId = randomUUID();

        const userItem = {
            userId,
            firstName: userData.firstName,
            lastName: userData.lastName,
            dob: userData.dob,
        };

        const emailItems = userData.emails.map(email => ({
            userId,
            email,
        }));

        //create PUT operations for the writes we need to do.
        const transactItems = [
            { Put: { TableName: Table.Users.tableName, Item: userItem } },
            //iterate over each item and create a PUT operation for it.
            ...emailItems.map(item => ({ Put: { TableName: Table.UserEmails.tableName, Item: item } })),
        ];

        //write to the db
        console.log("Attempting to create user and emails in DynamoDB...");
        await this.docClient.send(new TransactWriteCommand({ TransactItems: transactItems }));
        console.log("User and emails created successfully", { userId });
        return userId;
    }


    /**
     * Retrieves user data by user id.
     * @param userId - unique id for the user.
     */
    async getUser(userId: string): Promise<User> {
        console.log("Attempting to retrieve user from DynamoDB", { userId });

        // Fetch user data in parallel. Could also be done with a TransactGetCommand.
        const [userResult, emailResult] = await Promise.all([
            this.docClient.send(new GetCommand({
                TableName: Table.Users.tableName,
                Key: { userId },
            })),
            this.docClient.send(new QueryCommand({
                TableName: Table.UserEmails.tableName,
                KeyConditionExpression: "userId = :userId",
                ExpressionAttributeValues: { ":userId": userId },
            }))
        ]);

        if (!userResult.Item) {
            console.warn("User not found", { userId });
            throw new UserNotFoundError(`User with id ${userId} not found`);
        }

        const userData = userResult.Item;
        const userEmails = emailResult.Items?.map(item => item.email) || [];

        console.log("User and emails retrieved successfully", { userId });

        const user: User = {
            userId: userData.userId,
            dob: userData.dob,
            firstName: userData.firstName,
            lastName: userData.lastName,
            emails: userEmails
        };
        return user;
    }

    /**
     * Update the User and UserEmails tables.
     * emails will _only_ be added to the UserEmails table, as no deletions are permitted (we could wipe out all current
     * emails, and re-insert, but that isn't needed at this point)
     * @param userData - user data as it should be reflected in the db, except for emails
     */
    async updateUser(userData: UpdateUserRequest){
        const userItem = {
            userId: userData.userId,
            firstName: userData.firstName,
            lastName: userData.lastName,
            dob: userData.dob,
        };

        const emailItems = userData.emails.map(email => ({
            userId: userData.userId,
            email,
        }));

        //perform a batch of operations.
        const transactItems = [
            { Put: { TableName: Table.Users.tableName, Item: userItem } },
            //iterate over each item and create a PUT operation for it.
            ...emailItems.map(item => ({ Put: { TableName: Table.UserEmails.tableName, Item: item } })),
        ];

        await this.docClient.send(new TransactWriteCommand({ TransactItems: transactItems }));
    }

    /**
     * Delete a user from the Users table, along with associated entries in the UserEmails table.
     * @param userId - unique id for the user.
     */
    async deleteUser(userId: string) {
        // Fetch all emails associated with the user
        const emailResult = await this.docClient.send(new QueryCommand({
            TableName: Table.UserEmails.tableName,
            KeyConditionExpression: "userId = :userId",
            ExpressionAttributeValues: {":userId": userId},
        }));

        // Prepare delete operations
        const transactItems = [
            // Delete user
            {
                Delete: {
                    TableName: Table.Users.tableName,
                    Key: {userId},
                },
            },
            // Delete all associated emails
            ...(emailResult.Items || []).map(item => ({
                Delete: {
                    TableName: Table.UserEmails.tableName,
                    Key: {userId, email: item.email},
                },
            })),
        ];

        try {
            await this.docClient.send(new TransactWriteCommand({TransactItems: transactItems}));
            console.log("User and associated emails deleted successfully", {userId});
        } catch (error) {
            console.error("Failed to delete user and associated emails", error);
            throw new Error("Could not delete user and associated emails");
        }
    }
}
