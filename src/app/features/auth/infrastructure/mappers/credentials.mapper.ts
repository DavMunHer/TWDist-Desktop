import { Credentials } from "@features/auth/domain/value-objects/credentials.value-object";
import { LoginCredentialsDto } from "@features/auth/infrastructure/dto/request/login-credentials.dto";

export class CredentialsMapper {
  static toDomain(dto: LoginCredentialsDto): Credentials {
    return Credentials.create(dto.email, dto.password);
  }
  
  static toDto(credentials: Credentials): LoginCredentialsDto {
    return { email: credentials.email, password: credentials.password };
  }
}