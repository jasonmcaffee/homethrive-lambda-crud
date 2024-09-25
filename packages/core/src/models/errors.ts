import {z} from "zod";

export class InvalidRequestError extends Error {
    error
    details
    constructor(message: string, details: z.ZodIssue[]) {
        super(message);
        this.name = "InvalidRequestError";
        this.error = message;
        this.details = details;
    }
}

export class UserNotFoundError extends Error {
    error
    constructor(message: string) {
        super(message);
        this.error = message;
        this.name = "UserNotFoundError";
    }
}

export class HTTPMethodNotAllowed extends Error {
    error
    constructor(message: string) {
        super(message);
        this.name = "HTTPMethodNotAllowed";
        this.error = message;
    }
}
