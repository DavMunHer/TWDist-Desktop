import { UserResponseDto } from "@features/auth/infrastructure/dto/response/user-response.dto";

export interface AuthResponseDto {
  user: UserResponseDto; 
}