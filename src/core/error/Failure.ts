import { ERROR_MESSAGES } from '../constants/error_messages';

export abstract class Failure {
  public message: string;
  public code: number;

  constructor(message: string, code: number = 500) {
    this.message = message;
    this.code = code;
  }
}

export class ServerFailure extends Failure {
  constructor(message: string = ERROR_MESSAGES.INTERNAL_SERVER_ERROR) {
    super(message, 500);
  }
}

export class ValidationFailure extends Failure {
  constructor(message: string) {
    super(message, 400);
  }
}

export class NotFoundFailure extends Failure {
  constructor(message: string) {
    super(message, 404);
  }
}
