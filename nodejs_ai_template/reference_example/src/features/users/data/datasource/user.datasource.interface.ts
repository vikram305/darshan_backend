import { UserModel } from '../models/user.model';

export interface IUserDataSource {
  /**
   * @throws {DatabaseException} if connection fails
   * @throws {UniqueConstraintException} if email already exists
   */
  insertUser(email: string, firstName: string | null): Promise<UserModel>;
  
  /**
   * @throws {NotFoundException} if user id does not exist
   */
  findUserById(id: string): Promise<UserModel>;
}
