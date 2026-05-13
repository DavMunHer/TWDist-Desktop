import { Provider } from "@angular/core";
import { AuthRepository } from "@features/auth/domain/repositories/auth.repository";
import { HttpAuthRepository } from "@features/auth/infrastructure/repositories/http-auth.repository";
import { LoginUseCase } from "@features/auth/application/use-cases/login.use-case";
import { LogoutUseCase } from "@features/auth/application/use-cases/logout.use-case";
import { RefreshSessionUseCase } from "@features/auth/application/use-cases/refresh-session.use-case";
import { GetCurrentUserUseCase } from "@features/auth/application/use-cases/getCurrentUser.use-case";
import { CreateUserUseCase } from "@features/auth/application/use-cases/createUser.use-case";
import { UpdateUsernameUseCase } from "@features/auth/application/use-cases/update-username.use-case";
import { UpdatePasswordUseCase } from "@features/auth/application/use-cases/update-password.use-case";
import { TokenRefreshCoordinator } from "@features/auth/application/services/token-refresh-coordinator.service";
import { AuthStore } from "@features/auth/presentation/store/auth.store";

export const AUTH_FEATURE_PROVIDERS: Provider[] = [
  { provide: AuthRepository, useClass: HttpAuthRepository },
  
  LoginUseCase,
  LogoutUseCase,
  RefreshSessionUseCase,
  GetCurrentUserUseCase,
  CreateUserUseCase,
  UpdateUsernameUseCase,
  UpdatePasswordUseCase,
  TokenRefreshCoordinator,
  
  AuthStore,
];