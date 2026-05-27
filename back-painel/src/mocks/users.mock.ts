import type { UsersListResponse } from "../modules/users/users.schema";

export const usersListMock: UsersListResponse = {
  data: [
    {
      id: "user_admin_1",
      fullName: "Admin do Sistema",
      email: "admin@painel.com",
      role: "ADMIN",
      isActive: true,
    },
    {
      id: "user_vendor_1",
      fullName: "Joao Vendedor",
      email: "joao@painel.com",
      role: "VENDEDOR",
      isActive: true,
    },
  ],
  page: 1,
  pageSize: 10,
  totalItems: 2,
  totalPages: 1,
};

export const userSingleMock = usersListMock.data[0]!;
