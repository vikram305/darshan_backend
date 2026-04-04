import { Either } from '../../../../core/error/either';
import { Failure } from '../../../../core/error/failure';
import { UserEntity } from '../entities/user.entity';

export interface IUserRepository {
  createUser(email: string, firstName: string | null): Promise<Either<Failure, UserEntity>>;
  getUserById(id: string): Promise<Either<Failure, UserEntity>>;
}
