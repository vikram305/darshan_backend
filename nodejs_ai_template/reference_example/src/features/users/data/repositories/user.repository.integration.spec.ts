import "reflect-metadata";
import { UserRepositoryImpl } from './user.repository.impl';
import { UserDbDataSourceImpl, UniqueConstraintException, DatabaseException } from '../datasource/user_db.datasource.impl';
import { ServerFailure, DatabaseFailure } from '../../../../core/error/failure';

describe('UserRepositoryImpl Integration Tests', () => {
  let repository: UserRepositoryImpl;
  let dataSource: UserDbDataSourceImpl;

  beforeEach(() => {
    dataSource = new UserDbDataSourceImpl();
    repository = new UserRepositoryImpl(dataSource);
  });

  it('should map successful DB insertions to Right(UserEntity)', async () => {
    const result = await repository.createUser('user@integration.com', 'Integration');
    
    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.email).toBe('user@integration.com');
      expect(result.value.id).toBeDefined();
    }
  });

  it('should map UniqueConstraintException to Left(ServerFailure)', async () => {
    jest.spyOn(dataSource, 'insertUser').mockRejectedValue(new UniqueConstraintException('Dupe'));

    const result = await repository.createUser('dupe@test.com', null);
    
    expect(result.isLeft()).toBe(true);
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(ServerFailure);
      expect(result.value.message).toBe('Dupe');
    }
  });

  it('should map DatabaseException to Left(DatabaseFailure)', async () => {
    jest.spyOn(dataSource, 'insertUser').mockRejectedValue(new DatabaseException());

    const result = await repository.createUser('test@test.com', null);
    
    expect(result.isLeft()).toBe(true);
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(DatabaseFailure);
    }
  });
});
