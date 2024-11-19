import type { Role } from '@prisma/client';
import type { UserRepository } from '../../../repository/interfaces/UserRepository';
import { DeleteUserService } from 'services/user/DeleteUserService';

const notExistsId = '4a95d2c8-7e33-4215-85f1-46bd6a3a407e';
const existsId = '4a95d2c8-7e33-4215-85f1-46bd6a3a407a';
const idLoggedUser = '4a95d2c8-7e33-4215-85f1-46bd6a3a407b';
const mockUser = {
  id: '4a95d2c8-7e33-4215-85f1-46bd6a3a407e',
  name: 'Pablo',
  email: 'pablo@gmail.com',
  password: '$2a$08$6lpCFQrZGUQ7sgtjNG360Os2nYaSe8Gdc40zoYZhK9bnBHi5HmIze',
  createdAt: new Date(),
  updatedAt: new Date(),
  role: 'USER' as Role,
};

const userRepositoryMock: jest.Mocked<UserRepository> = {
  create: jest.fn(),
  findByEmail: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  index: jest.fn(),
};

describe('Create User Service', () => {
  let deleteUserService: DeleteUserService;

  beforeEach(() => {
    userRepositoryMock.findById.mockImplementation(async (id) => {
      if (id === existsId || id === idLoggedUser) {
        mockUser.id = id;
        return mockUser;
      }
      return null;
    });

    userRepositoryMock.delete.mockImplementation(async () => {});
    deleteUserService = new DeleteUserService(userRepositoryMock);
  });

  it('should delete a user', async () => {
    await deleteUserService.execute({ id: idLoggedUser, userId: existsId });
    expect(userRepositoryMock.delete).toHaveBeenCalledTimes(1);
    expect(userRepositoryMock.findById).toHaveBeenCalledTimes(1);
  });

  it('should not delete a user that does not exist', async () => {
    await expect(
      deleteUserService.execute({ id: notExistsId, userId: notExistsId }),
    ).rejects.toThrow('User not found');
    expect(userRepositoryMock.delete).toHaveBeenCalledTimes(0);
  });

  it('should not delete a user that is not the user itself', async () => {
    await expect(
      deleteUserService.execute({ id: idLoggedUser, userId: idLoggedUser }),
    ).rejects.toThrow('You can only delete your own user');
    expect(userRepositoryMock.delete).toHaveBeenCalledTimes(0);
  });
});
