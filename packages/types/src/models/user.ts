/**
 * User Models
 * @see API仕様定義書 6.2.1, 6.2.2
 */

export type UserRole = "user" | "user_plus" | "creator" | "creator_plus";

export type User = {
  id: string;
  cognitoSub?: string; // BE only
  email: string;
  name: string;
  role: UserRole;
  avatarUrl: string | null;
  stripeCustomerId?: string; // BE only
  defaultPaymentMethodId?: string; // BE only
  createdAt: string; // ISO8601
  updatedAt?: string; // ISO8601
};

export type UserPublic = Pick<User, "id" | "email" | "name" | "role" | "avatarUrl" | "createdAt">;
