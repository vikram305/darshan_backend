import { Router } from 'express';
import { container } from 'tsyringe';
import { UserController } from '../controllers/user.controller';

// A mock validation middleware function
export const validateDto = (schema: any) => (req: any, res: any, next: any) => {
  try {
    schema.parse({ body: req.body, query: req.query, params: req.params });
    next();
  } catch (err: any) {
    return res.status(400).send(err.errors);
  }
};

import { CreateUserSchema } from '../dtos/create_user.dto';

const userRouter = Router();

// Resolve the controller from the DI container
const userController = container.resolve(UserController);

userRouter.post(
  '/', 
  validateDto(CreateUserSchema), // Middleware blocks bad requests here
  userController.createUser      // Clean Controller handles success logic
);

export { userRouter };
