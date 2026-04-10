import { AuthFlowError } from '@features/auth/application/errors/auth-flow.error';
import { Credentials } from "@features/auth/domain/value-objects/credentials.value-object";
import { LoginCredentialsDto } from "@features/auth/infrastructure/dto/request/login-credentials.dto";
import { Result } from '@shared/utils/result';

export class CredentialsMapper {
  static toDomain(dto: LoginCredentialsDto): Result<Credentials, AuthFlowError> {
    return Credentials.tryCreate(dto.email, dto.password);
  }
  
  static toDto(credentials: Credentials): LoginCredentialsDto {
    return { email: credentials.email, password: credentials.password };
  }
}