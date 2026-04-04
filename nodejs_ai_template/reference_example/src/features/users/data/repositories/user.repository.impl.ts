import { inject, injectable } from 'tsyringe';
import { Either, left, right } from '../../../../core/error/either';
import { Failure, ServerFailure, DatabaseFailure, NotFoundFailure } from '../../../../core/error/failure';
import { UserEntity } from '../../domain/entities/user.entity';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { IUserDataSource } from '../datasource/user.datasource.interface';
import { UniqueConstraintException, NotFoundException, DatabaseException } from '../datasource/user_db.datasource.impl';
import { UserModelMapper } from '../models/user.model';

@injectable()
export class UserRepositoryImpl implements IUserRepository {
  constructor(
    @inject('IUserDataSource') private readonly dataSource: IUserDataSource
  ) {}

  async createUser(email: string, firstName: string | null): Promise<Either<Failure, UserEntity>> {
    try {
      const resultModel = await this.dataSource.insertUser(email, firstName);
      return right(UserModelMapper.toEntity(resultModel));
    } catch (error) {
      if (error instanceof UniqueConstraintException) {
        return left(new ServerFailure(error.message));
      }
      if (error instanceof DatabaseException) {
        return left(new DatabaseFailure('Lost connection to db'));
      }
      return left(new ServerFailure('Unknown error occurred'));
    }
  }

  async getUserById(id: string): Promise<Either<Failure, UserEntity>> {
    try {
      const resultModel = await this.dataSource.findUserById(id);
      return right(UserModelMapper.toEntity(resultModel));
    } catch (error) {
      if (error instanceof NotFoundException) {
        return left(new NotFoundFailure(error.message));
      }
      return left(new ServerFailure('Unknown error occurred'));
    }
  }
}
