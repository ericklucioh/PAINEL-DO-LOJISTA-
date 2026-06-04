import { getPrisma } from "../config/prisma";
import { createAuthController } from "../modules/auth/auth.controller";
import { createAuthRouter } from "../modules/auth/auth.routes";
import { createAuthService } from "../modules/auth/auth.service";
import type { AuthController } from "../modules/auth/auth.controller";
import { createCashRegistersController } from "../modules/cash-registers/cash-registers.controller";
import { createCashRegistersRouter } from "../modules/cash-registers/cash-registers.routes";
import { createCashRegistersService } from "../modules/cash-registers/cash-registers.service";
import type { CashRegistersController } from "../modules/cash-registers/cash-registers.controller";
import { createProductsController } from "../modules/products/products.controller";
import { createProductsRouter } from "../modules/products/products.routes";
import { createProductsService } from "../modules/products/products.service";
import type { ProductsController } from "../modules/products/products.controller";
import { createSalesController } from "../modules/sales/sales.controller";
import { createSalesRouter } from "../modules/sales/sales.routes";
import { createSalesProductsService } from "../modules/sales-products/sales-products.service";
import { createSalesService } from "../modules/sales/sales.service";
import type { SalesController } from "../modules/sales/sales.controller";
import { createStockController } from "../modules/stock/stock.controller";
import { createStockRouter } from "../modules/stock/stock.routes";
import { createStockService } from "../modules/stock/stock.service";
import type { StockController } from "../modules/stock/stock.controller";
import { createUsersController } from "../modules/users/users.controller";
import { createUsersRouter } from "../modules/users/users.routes";
import { createUsersService } from "../modules/users/users.service";
import type { UsersController } from "../modules/users/users.controller";

export interface BackendDependencies {
    authController?: AuthController;
    usersController?: UsersController;
    productsController?: ProductsController;
    stockController?: StockController;
    salesController?: SalesController;
    cashRegistersController?: CashRegistersController;
}

export interface BackendRoutes {
    authRouter: ReturnType<typeof createAuthRouter>;
    usersRouter: ReturnType<typeof createUsersRouter>;
    productsRouter: ReturnType<typeof createProductsRouter>;
    stockRouter: ReturnType<typeof createStockRouter>;
    salesRouter: ReturnType<typeof createSalesRouter>;
    cashRegistersRouter: ReturnType<typeof createCashRegistersRouter>;
}

export function createBackendRoutes(
    dependencies: BackendDependencies = {},
): BackendRoutes {
    const prisma = getPrisma();

    const authController =
        dependencies.authController ??
        createAuthController({
            service: createAuthService({
                prisma,
            }),
        });
    const usersController =
        dependencies.usersController ??
        createUsersController({
            service: createUsersService({
                prisma,
            }),
        });
    const productsController =
        dependencies.productsController ??
        createProductsController({
            service: createProductsService({
                prisma,
            }),
        });
    const stockController =
        dependencies.stockController ??
        createStockController({
            service: createStockService({
                prisma,
            }),
        });
    const salesController =
        dependencies.salesController ??
        createSalesController({
            service: createSalesService({
                prisma,
                salesProductsService: createSalesProductsService(),
            }),
        });
    const cashRegistersController =
        dependencies.cashRegistersController ??
        createCashRegistersController({
            service: createCashRegistersService({
                prisma,
            }),
        });

    return {
        authRouter: createAuthRouter({
            controller: authController,
        }),
        usersRouter: createUsersRouter({
            controller: usersController,
        }),
        productsRouter: createProductsRouter({
            controller: productsController,
        }),
        stockRouter: createStockRouter({
            controller: stockController,
        }),
        salesRouter: createSalesRouter({
            controller: salesController,
        }),
        cashRegistersRouter: createCashRegistersRouter({
            controller: cashRegistersController,
        }),
    };
}
