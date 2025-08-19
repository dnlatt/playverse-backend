// Defines the structure for the JWT payload.
export interface JWTPayload {
  userId: number;
  email: string;
  roleId: number;
}