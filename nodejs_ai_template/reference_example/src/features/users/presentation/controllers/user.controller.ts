import { Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import { CreateUserUseCase } from '../../domain/usecases/create_user.usecase';
import { CreateUserDto } from '../dtos/create_user.dto';

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
      ? res.status(201).json({ success: true, data: result.value })
      : res.status(400).json({ success: false, error: result.value.message });
  };
}
