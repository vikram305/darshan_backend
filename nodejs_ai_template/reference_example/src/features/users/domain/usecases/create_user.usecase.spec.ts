import "reflect-metadata";
import { CreateUserUseCase } from './create_user.usecase';
import { IUserRepository } from '../repositories/user.repository.interface';
import { UserEntity } from '../entities/user.entity';
import { right, left } from '../../../../core/error/either';
import { ServerFailure } from '../../../../core/error/failure';

describe('CreateUserUseCase Unit Tests', () => {
  let useCase: CreateUserUseCase;
  let mockUserRepository: jest.Mocked<IUserRepository>;

  beforeEach(() => {
    // Mock the abstract repository interface
    mockUserRepository = {
      createUser: jest.fn(),
      getUserById: jest.fn()
    };
    useCase = new CreateUserUseCase(mockUserRepository);
  });

  it('should return a Right(UserEntity) on successful creation', async () => {
    // Arrange
    const tUser = new UserEntity('123', 'test@test.com', 'John', new Date());
    mockUserRepository.createUser.mockResolvedValue(right(tUser));

    // Act
    const result = await useCase.execute({ email: ' TEST@Test.com ', firstName: 'John' });

    // Assert
    expect(result.isRight()).toBe(true);
    expect((result as any).value).toEqual(tUser);
    
    // Validates pure domain logic manipulation (lowercasing strings)
    expect(mockUserRepository.createUser).toHaveBeenCalledWith('test@test.com', 'John');
  });

  it('should return Left(Failure) when repository fails', async () => {
    // Arrange
    const tFailure = new ServerFailure('Email already exists');
    mockUserRepository.createUser.mockResolvedValue(left(tFailure));

    // Act
    const result = await useCase.execute({ email: 'test@test.com', firstName: 'John' });

    // Assert
    expect(result.isLeft()).toBe(true);
    expect((result as any).value).toEqual(tFailure);
  });
});
