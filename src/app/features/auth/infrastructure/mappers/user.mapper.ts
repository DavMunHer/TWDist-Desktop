import { User } from "../../domain/entities/user.entity";
import { UserResponseDto } from "../dto/response/user-response.dto";

export class UserMapper {
  static toDomain(dto: UserResponseDto): User {
    return new User(
      String(dto.id),
      dto.email,
      dto.username
    );
  }
}