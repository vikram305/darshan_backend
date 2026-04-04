import { Either } from '../error/either';
import { Failure } from '../error/failure';

export interface UseCase<Type, Params> {
  execute(params: Params): Promise<Either<Failure, Type>>;
}

export class NoParams {}
