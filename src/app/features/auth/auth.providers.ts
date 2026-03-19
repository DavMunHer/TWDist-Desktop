import { Provider } from "@angular/core";
import { AuthRepository } from "@features/auth/domain/repositories/auth.repository";
import { HttpAuthRepository } from "@features/auth/infrastructure/repositories/http-auth.repository";
import { LoginUseCase } from "@features/auth/application/use-cases/login.use-case";
import { LogoutUseCase } from "@features/auth/application/use-cases/logout.use-case";
import { GetCurrentUserUseCase } from "@features/auth/application/use-cases/getCurrentUser.use-case";
import { CreateUserUseCase } from "@features/auth/application/use-cases/createUser.use-case";
import { AuthStore } from "@features/auth/presentation/store/auth.store";

export const AUTH_FEATURE_PROVIDERS: Provider[] = [
  { provide: AuthRepository, useClass: HttpAuthRepository },
  
  LoginUseCase,
  LogoutUseCase,
  GetCurrentUserUseCase,
  CreateUserUseCase,
  
  AuthStore,
];