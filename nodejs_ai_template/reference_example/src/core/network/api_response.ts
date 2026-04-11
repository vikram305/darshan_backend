export class ApiResponse {
  static success<T>(data: T, message: string = 'Success') {
    return {
      success: true,
      message,
      data,
    };
  }

  static error(message: string, data: any = null) {
    return {
      success: false,
      message,
      data,
    };
  }
}
