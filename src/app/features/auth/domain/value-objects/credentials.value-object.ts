import { format } from "path";

export class Credentials {
  constructor(
    public readonly email: string,
    public readonly password: string
  ) {
    // Domain validation
    if (!email || !password) {
      // TODO: Verify email format
      throw new Error('Email and password are required');
    }
  }

  static create(email: string, password: string): Credentials {
    return new Credentials(email, password);
  }
}