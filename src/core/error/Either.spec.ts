import { left, right, Either } from './Either';

describe('Either Pattern', () => {
  it('should correctly identify Right values', () => {
    const success: Either<string, number> = right(42);
    expect(success.isRight()).toBe(true);
    expect(success.isLeft()).toBe(false);
    expect((success as any).value).toBe(42);
  });

  it('should correctly identify Left values', () => {
    const failure: Either<string, number> = left('error message');
    expect(failure.isLeft()).toBe(true);
    expect(failure.isRight()).toBe(false);
    expect((failure as any).value).toBe('error message');
  });
});
