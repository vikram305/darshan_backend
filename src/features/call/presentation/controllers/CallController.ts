import { Request, Response } from 'express';
import { container } from '../../../../core/di/injection';
import { CreateRoomUseCase } from '../../domain/usecases/CreateRoomUseCase';

export class CallController {
  static async createRoom(req: Request, res: Response): Promise<void> {
    const useCase = container.resolve(CreateRoomUseCase);
    
    const result = await useCase.execute();

    if (result.isLeft()) {
      res.status(result.value.code).json({ error: result.value.message });
      return;
    }

    res.status(201).json({ room: result.value });
  }
}
