import {z} from "zod";
import {CreateUserRequest, UpdateUserRequest, User} from "@homethrive-lambda-crud/core/models/user";
import {InvalidRequestError, UserNotFoundError} from "@homethrive-lambda-crud/core/models/errors";
import {
    createUserSchema,
    maxEmails,
    updateUserSchema,
    userIdSchema
} from "@homethrive-lambda-crud/core/schemas/userSchemas";
import {UserRepository} from "@homethrive-lambda-crud/core/repositories/UserRepository";

/**
 * Service for creating, updating, and deleting users.
 * Provides functionality to interact with dynamo db, validate user input, and throwing typed errors so the api can map
 * to appropriate status codes.
 */
export class UserService{
    private userRepository: UserRepository;

    constructor(userRepository: UserRepository = new UserRepository()) {
        this.userRepository = userRepository;
    }

    /**
     * Create the user.
     * A new id is created.  Does not check for duplicate entries, as the assumption is that a single email can have
     * multiple users associated with it.
     * @param createUserRequest - data used in creating the user, including emails, dob, and name.
     */
    async createUser(createUserRequest: CreateUserRequest): Promise<User> {
        const validatedRequest = validateCreateUserRequest(createUserRequest);

        //write to the db
        try {
            console.log("Attempting to create user and emails in DynamoDB...");
            const userId = await this.userRepository.createUser(validatedRequest);
            console.log("User and emails created successfully", { userId });
            //ensure we use the source of truth for user data in case there are db related modifications (triggers, etc)
            return await this.getUser(userId);
        } catch (e) {
            console.error("Failed to create user", e);
            throw new Error("Could not create user");
        }
    }

    /**
     * Retrieve a user and their associated emails.
     * @param userId - The ID of the user to retrieve.
     * @returns The user data including their emails.
     * @throws {InvalidRequestError} If the userId is undefined or invalid.
     * @throws {UserNotFoundError} If no user is found with the given userId.
     */
    async getUser(userId: string | undefined): Promise<User> {
        const validatedUserId = validateUserId(userId);

        try {
           return await this.userRepository.getUser(validatedUserId);
        } catch (error) {
            if (error instanceof UserNotFoundError) {
                throw error;
            }
            console.error("Failed to retrieve user", { userId, error: error instanceof Error ? error.message : String(error) });
            throw new Error("Could not retrieve user");
        }
    }


    /**
     * PUT operations require the entire current state of the User and UserEmails (vs a PATCH which can be partial),
     * therefore the database will reflect the data in the updateUserRequest param.
     * @param updateUserRequest - the complete user data as it should be reflected in the db.
     */
    async updateUser(updateUserRequest: UpdateUserRequest){
        // ensure the request is valid, and that no existing emails are missing from the request.
        const validatedRequest = validateUpdateUserRequest(updateUserRequest);

        //validate both that the user exists, and that there are no emails are being removed.
        const currentUser = await this.getUser(updateUserRequest.userId);
        validateNoEmailsAreAttemptedToBeRemoved(currentUser.emails, validatedRequest.emails);

        // get the new emails to be added, as only those will be passed to the repository
        const emailsToAdd = validatedRequest.emails.filter(e => !currentUser.emails.includes(e));

        try{
            // update our request sent to the repo so that it only includes the emails to be inserted
            await this.userRepository.updateUser({...validatedRequest, emails: emailsToAdd});
            return this.getUser(validatedRequest.userId);
        } catch (error) {
            console.error("Failed to update user", error);
            if (error instanceof UserNotFoundError) {
                throw error;
            }
            throw new Error("Could not update user");
        }
    }

    async deleteUser(userId: string | undefined){
        const validatedUserId = validateUserId(userId);
        //ensure the user exists. If not, we want the client to know its doing something invalid.
        await this.getUser(validatedUserId);
        try{
            //delete
            await this.userRepository.deleteUser(validatedUserId);
        } catch (e) {
            console.error("Failed to delete user", e);
            throw new Error("Could not delete user");
        }
    }
}

function validateNoEmailsAreAttemptedToBeRemoved(currentEmails: string[], newEmails: string[]) {
    const missingEmails = currentEmails.filter(email => !newEmails.includes(email));
    if (missingEmails.length > 0) {
        throw new InvalidRequestError("you are not allowed to remove an email", []);
    }
}

function validateUserId(userId: string | undefined){
    try{
        return userIdSchema.parse(userId);
    } catch (error) {
        throw new InvalidRequestError("Invalid user id", (error as z.ZodError).errors);
    }
}

/**
 * Helper function to validate the user request adheres to the zod schema.
 * Throws InvalidRequestError if it does not.
 * @param createUserRequest - data used in creating the user, including emails, dob, and name.
 */
function validateCreateUserRequest(createUserRequest: CreateUserRequest){
    try {
        return createUserSchema.parse(createUserRequest);
    } catch (error) {
        console.warn("Invalid user data", { error });
        throw new InvalidRequestError("Invalid user data", (error as z.ZodError).errors);
    }
}

function validateUpdateUserRequest(updateUserRequest: UpdateUserRequest){
    try {
        return updateUserSchema.parse(updateUserRequest);
    } catch (error) {
        console.warn("Invalid user data", { error });
        throw new InvalidRequestError("Invalid user data", (error as z.ZodError).errors);
    }
}
