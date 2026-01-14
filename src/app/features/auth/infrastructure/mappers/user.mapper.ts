import { User } from "../../domain/entities/user.entity";
import { RegisterCredentialsDto } from "../dto/request/register-credentials.dto";
import { UserResponseDto } from "../dto/response/user-response.dto";

export class UserMapper {
  static toDomain(dto: UserResponseDto): User {
    return new User(
      String(dto.id),
      dto.email,
      dto.username
    );
  }

  static toDto(user: User): RegisterCredentialsDto {
    return {
      email: user.email,
      username: user.username,
      password: '' // Password is not stored in User entity; placeholder for DTO
    };
  }
}