export abstract class Failure {
  constructor(public readonly message: string) {}
}

export class ServerFailure extends Failure {
  constructor(message: string = 'Internal Server Error') {
    super(message);
  }
}

export class DatabaseFailure extends Failure {
  constructor(message: string = 'Database connection failed') {
    super(message);
  }
}

export class NotFoundFailure extends Failure {
  constructor(message: string = 'Resource not found') {
    super(message);
  }
}

export class ValidationFailure extends Failure {
  constructor(message: string = 'Validation failed') {
    super(message);
  }
}
