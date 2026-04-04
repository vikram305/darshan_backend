import { injectable } from 'tsyringe';
import { IUserDataSource } from './user.datasource.interface';
import { UserModel } from '../models/user.model';

// Fake exceptions to simulate an ORM or Driver like Mongoose/Prisma
export class UniqueConstraintException extends Error {}
export class DatabaseException extends Error {}
export class NotFoundException extends Error {}

@injectable()
export class UserDbDataSourceImpl implements IUserDataSource {
  
  // Simulated database
  private db: UserModel[] = [];

  async insertUser(email: string, firstName: string | null): Promise<UserModel> {
    const exists = this.db.find(u => u.email_address === email);
    if (exists) {
      throw new UniqueConstraintException('Email already exists in database');
    }

    const newUser: UserModel = {
      _id: Math.random().toString(36).substring(7),
      email_address: email,
      first_name: firstName,
      created_at: new Date()
    };
    
    this.db.push(newUser);
    return newUser;
  }

  async findUserById(id: string): Promise<UserModel> {
    const user = this.db.find(u => u._id === id);
    if (!user) throw new NotFoundException(`No user found with id ${id}`);
    return user;
  }
}
