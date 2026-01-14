import { Provider } from "@angular/core";
import { AuthRepository } from "./domain/repositories/auth.repository";
import { HttpAuthRepository } from "./infrastructure/repositories/http-auth.repository";
import { LoginUseCase } from "./application/use-cases/login.use-case";
import { LogoutUseCase } from "./application/use-cases/logout.use-case";
import { GetCurrentUserUseCase } from "./application/use-cases/getCurrentUser.use-case";
import { AuthStore } from "./presentation/store/auth.store";
import { CreateUserUseCase } from "./application/use-cases/createUser.use-case";

export const AUTH_FEATURE_PROVIDERS: Provider[] = [
  { provide: AuthRepository, useClass: HttpAuthRepository },
  
  LoginUseCase,
  LogoutUseCase,
  GetCurrentUserUseCase,
  CreateUserUseCase,
  
  AuthStore,
];