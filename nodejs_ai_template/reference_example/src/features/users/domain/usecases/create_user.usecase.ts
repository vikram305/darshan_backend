import { inject, injectable } from 'tsyringe';
import { Either } from '../../../../core/error/either';
import { Failure } from '../../../../core/error/failure';
import { UseCase } from '../../../../core/usecases/usecase.interface';
import { UserEntity } from '../entities/user.entity';
import { IUserRepository } from '../repositories/user.repository.interface';

export interface CreateUserParams {
  email: string;
  firstName: string | null;
}

@injectable()
export class CreateUserUseCase implements UseCase<UserEntity, CreateUserParams> {
  // Dependency Inversion: Depends on the abstraction (IUserRepository), not the implementation
  constructor(
    @inject('IUserRepository') private readonly userRepository: IUserRepository
  ) {}

  async execute(params: CreateUserParams): Promise<Either<Failure, UserEntity>> {
    // Pure Domain logic: validate, manipulate strings, apply business rules
    const formattedEmail = params.email.trim().toLowerCase();
    
    return await this.userRepository.createUser(formattedEmail, params.firstName);
  }
}
