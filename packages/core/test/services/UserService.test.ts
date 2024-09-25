import { UserService } from '@homethrive-lambda-crud/core/services/UserService';
import { UserRepository } from '@homethrive-lambda-crud/core/repositories/UserRepository';
import { InvalidRequestError, UserNotFoundError } from '@homethrive-lambda-crud/core/models/errors';
import { CreateUserRequest, UpdateUserRequest, User } from "@homethrive-lambda-crud/core/models/user";

import {expect, it, describe, vi} from "vitest";

// Mock the UserRepository
vi.mock('@homethrive-lambda-crud/core/repositories/UserRepository');

// Mock data
const mockUser: User = {
    userId: '123e4567-e89b-12d3-a456-426614174000',
    firstName: 'John',
    lastName: 'Doe',
    dob: '1990-01-01',
    emails: ['john@example.com']
};

const mockCreateUserRequest: CreateUserRequest = {
    firstName: 'John',
    lastName: 'Doe',
    dob: '1990-01-01',
    emails: ['john@example.com']
};

const mockUpdateUserRequest: UpdateUserRequest = {
    ...mockUser,
    firstName: 'Jane'
};

describe('UserService', () => {
    let userService: UserService;
    let mockUserRepository: UserRepository;

    beforeEach(() => {
        mockUserRepository = new UserRepository() as any;
        userService = new UserService(mockUserRepository);
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    describe('createUser', () => {
        it('should create a user successfully', async () => {
            vi.spyOn(mockUserRepository, 'createUser').mockResolvedValue(mockUser.userId);
            vi.spyOn(mockUserRepository, 'getUser').mockResolvedValue(mockUser);

            const result = await userService.createUser(mockCreateUserRequest);

            expect(result).toEqual(mockUser);
            expect(mockUserRepository.createUser).toHaveBeenCalledWith(mockCreateUserRequest);
            expect(mockUserRepository.getUser).toHaveBeenCalledWith(mockUser.userId);
        });

        it('should throw InvalidRequestError for invalid user data', async () => {
            await expect(userService.createUser({
                ...mockCreateUserRequest,
                firstName: ''
            })).rejects.toThrow(InvalidRequestError);

            await expect(userService.createUser({
                ...mockCreateUserRequest,
                lastName: '909*'
            })).rejects.toThrow(InvalidRequestError);

            await expect(userService.createUser({
                ...mockCreateUserRequest,
                dob: '10/10/1945'
            })).rejects.toThrow(InvalidRequestError);
        });

        it('should throw an error if creation fails', async () => {
            vi.spyOn(mockUserRepository, 'createUser').mockRejectedValue(new Error('DB Error'));

            await expect(userService.createUser(mockCreateUserRequest)).rejects.toThrow('Could not create user');
        });
    });

    describe('getUser', () => {
        it('should retrieve a user successfully', async () => {
            vi.spyOn(mockUserRepository, 'getUser').mockResolvedValue(mockUser);

            const result = await userService.getUser(mockUser.userId);

            expect(result).toEqual(mockUser);
            expect(mockUserRepository.getUser).toHaveBeenCalledWith(mockUser.userId);
        });

        it('should throw InvalidRequestError for invalid userId', async () => {
            await expect(userService.getUser('invalid-id')).rejects.toThrow(InvalidRequestError);
        });

        it('should throw UserNotFoundError when user does not exist', async () => {
            vi.spyOn(mockUserRepository, 'getUser').mockRejectedValue(new UserNotFoundError('User not found'));

            await expect(userService.getUser(mockUser.userId)).rejects.toThrow(UserNotFoundError);
        });
    });

    describe('updateUser', () => {
        it('should update a user successfully', async () => {
            vi.spyOn(mockUserRepository, 'getUser').mockResolvedValue(mockUser);
            vi.spyOn(mockUserRepository, 'updateUser').mockResolvedValue(undefined);

            const updatedUser = { ...mockUser, firstName: 'Jane' };
            vi.spyOn(mockUserRepository, 'getUser').mockResolvedValue(updatedUser);

            const result = await userService.updateUser(mockUpdateUserRequest);

            expect(result).toEqual(updatedUser);
            //since we only pass new emails to add to the repo, pass an empty emails array.
            expect(mockUserRepository.updateUser).toHaveBeenCalledWith({...mockUpdateUserRequest, emails: []});
        });

        it('should throw InvalidRequestError for invalid update data', async () => {
            const invalidRequest = { ...mockUpdateUserRequest, firstName: '' };

            await expect(userService.updateUser(invalidRequest)).rejects.toThrow(InvalidRequestError);
        });

        it('should throw an error if trying to remove an email', async () => {
            vi.spyOn(mockUserRepository, 'getUser').mockResolvedValue(mockUser);

            const requestWithRemovedEmail = { ...mockUpdateUserRequest, emails: [] };

            await expect(userService.updateUser(requestWithRemovedEmail)).rejects.toThrow(InvalidRequestError);
        });

        it('should throw UserNotFoundError when updating non-existent user', async () => {
            vi.spyOn(mockUserRepository, 'getUser').mockRejectedValue(new UserNotFoundError('User not found'));

            await expect(userService.updateUser(mockUpdateUserRequest)).rejects.toThrow(UserNotFoundError);
        });
    });

    describe('deleteUser', () => {
        it('should delete a user successfully', async () => {
            vi.spyOn(mockUserRepository, 'getUser').mockResolvedValue(mockUser);
            vi.spyOn(mockUserRepository, 'deleteUser').mockResolvedValue(undefined);

            await expect(userService.deleteUser(mockUser.userId)).resolves.not.toThrow();
            expect(mockUserRepository.deleteUser).toHaveBeenCalledWith(mockUser.userId);
        });

        it('should throw InvalidRequestError for invalid userId', async () => {
            await expect(userService.deleteUser('invalid-id')).rejects.toThrow(InvalidRequestError);
        });

        it('should throw UserNotFoundError when deleting non-existent user', async () => {
            vi.spyOn(mockUserRepository, 'getUser').mockRejectedValue(new UserNotFoundError('User not found'));

            await expect(userService.deleteUser(mockUser.userId)).rejects.toThrow(UserNotFoundError);
        });

        it('should throw an error if deletion fails', async () => {
            vi.spyOn(mockUserRepository, 'getUser').mockResolvedValue(mockUser);
            vi.spyOn(mockUserRepository, 'deleteUser').mockRejectedValue(new Error('DB Error'));

            await expect(userService.deleteUser(mockUser.userId)).rejects.toThrow('Could not delete user');
        });
    });
});
