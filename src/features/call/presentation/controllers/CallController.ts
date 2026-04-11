import { Request, Response } from 'express';
import { container } from '../../../../core/di/injection';
import { CreateRoomUseCase } from '../../domain/usecases/CreateRoomUseCase';
import { ApiResponse } from '../../../../core/network/api_response';
import { HttpStatus } from '../../../../core/constants/http_status';

export class CallController {
  static async createRoom(req: Request, res: Response): Promise<void> {
    const useCase = container.resolve(CreateRoomUseCase);
    
    const result = await useCase.execute();

    if (result.isLeft()) {
      res.status(result.value.code).json(ApiResponse.error(result.value.message));
      return;
    }

    res.status(HttpStatus.CREATED).json(ApiResponse.success({ room: result.value }, 'Room created successfully'));
  }
}
