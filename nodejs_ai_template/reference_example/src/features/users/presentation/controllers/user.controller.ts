import { Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import { CreateUserUseCase } from '../../domain/usecases/create_user.usecase';
import { CreateUserDto } from '../dtos/create_user.dto';
import { ApiResponse } from '../../../../core/network/api_response';
import { HttpStatus } from '../../../../core/constants/http_status';

@injectable()
export class UserController {
  constructor(
    @inject(CreateUserUseCase) private readonly createUserUseCase: CreateUserUseCase
  ) {}

  public createUser = async (req: Request, res: Response): Promise<void> => {
    const dto: CreateUserDto = req.body;

    const result = await this.createUserUseCase.execute({
      email: dto.email,
      firstName: dto.firstName ?? null
    });

    result.isRight()
      ? res.status(HttpStatus.CREATED).json(ApiResponse.success(result.value, 'User created successfully'))
      : res.status(HttpStatus.BAD_REQUEST).json(ApiResponse.error(result.value.message));
  };
}
