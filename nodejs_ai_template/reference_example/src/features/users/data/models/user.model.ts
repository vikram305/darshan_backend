export interface UserModel {
  _id: string; // E.g., MongoDB ObjectId string
  email_address: string;
  first_name: string | null;
  created_at: Date;
}

// Mapper to map between DB output and Domain Entity
import { UserEntity } from '../../domain/entities/user.entity';

export class UserModelMapper {
  static toEntity(model: UserModel): UserEntity {
    return new UserEntity(
      model._id,
      model.email_address,
      model.first_name,
      model.created_at
    );
  }
}
