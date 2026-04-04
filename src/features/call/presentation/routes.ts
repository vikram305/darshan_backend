import { Router } from 'express';
import { CallController } from './controllers/CallController';

export const callRouter = Router();

callRouter.post('/room', CallController.createRoom);
