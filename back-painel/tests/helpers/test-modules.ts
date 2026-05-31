import { createAuthController } from "../../src/modules/auth/auth.controller";
import { createAuthRouter } from "../../src/modules/auth/auth.routes";
import { createAuthService } from "../../src/modules/auth/auth.service";
import type { AuthController } from "../../src/modules/auth/auth.controller";
import { createProductsController } from "../../src/modules/products/products.controller";
import { createProductsRouter } from "../../src/modules/products/products.routes";
import { createProductsService } from "../../src/modules/products/products.service";
import type { ProductsController } from "../../src/modules/products/products.controller";
import { createUsersController } from "../../src/modules/users/users.controller";
import { createUsersRouter } from "../../src/modules/users/users.routes";
import { createUsersService } from "../../src/modules/users/users.service";
import type { UsersController } from "../../src/modules/users/users.controller";
import { createTestClient } from "./test-client";

type TestPrismaForServices =
    Parameters<typeof createAuthService>[0]["prisma"] &
    Parameters<typeof createUsersService>[0]["prisma"] &
    Parameters<typeof createProductsService>[0]["prisma"];

export interface TestModules {
    prisma: ReturnType<typeof createTestClient>;
    authController: AuthController;
    usersController: UsersController;
    productsController: ProductsController;
    authRouter: ReturnType<typeof createAuthRouter>;
    usersRouter: ReturnType<typeof createUsersRouter>;
    productsRouter: ReturnType<typeof createProductsRouter>;
    close(): Promise<void>;
}

export function createTestModules(): TestModules {
    const prisma = createTestClient();
    const prismaForServices = prisma as TestPrismaForServices;

    const authController = createAuthController({
        service: createAuthService({ prisma: prismaForServices }),
    });
    const usersController = createUsersController({
        service: createUsersService({ prisma: prismaForServices }),
    });
    const productsController = createProductsController({
        service: createProductsService({ prisma: prismaForServices }),
    });

    return {
        prisma,
        authController,
        usersController,
        productsController,
        authRouter: createAuthRouter({ controller: authController }),
        usersRouter: createUsersRouter({ controller: usersController }),
        productsRouter: createProductsRouter({ controller: productsController }),
        close: () => prisma.$disconnect(),
    };
}
