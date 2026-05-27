import type { AuthLoginResponse, AuthRefreshResponse } from "../modules/auth/auth.schema";

export const authLoginMock: AuthLoginResponse = {
  accessToken: "mock-access-token",
  refreshToken: "mock-refresh-token",
  expiresIn: 900,
  user: {
    id: "user_admin_1",
    fullName: "Admin do Sistema",
    email: "admin@painel.com",
    role: "ADMIN",
  },
};

export const authRefreshMock: AuthRefreshResponse = {
  accessToken: "mock-access-token-refreshed",
  expiresIn: 900,
};
