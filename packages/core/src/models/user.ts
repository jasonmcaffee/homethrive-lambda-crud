/**
 * Request object for creating a user
 */
export interface CreateUserRequest {
    emails: string[],
    dob: string,
    firstName: string,
    lastName: string
}

/**
 * General user model used in responses
 */
export interface User {
    emails: string[],
    dob: string,
    firstName: string,
    lastName: string,
    userId: string,
}

export interface UpdateUserRequest {
    emails: string[],
    dob: string,
    firstName: string,
    lastName: string,
    userId: string,
}
