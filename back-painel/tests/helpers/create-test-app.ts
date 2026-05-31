import { createApp } from "../../src/app";
import type { Express } from "express";
import { createTestModules } from "./test-modules";

export interface TestApp {
    app: Express;
    close(): Promise<void>;
}

export function createTestApp(): TestApp {
    const modules = createTestModules();

    return {
        app: createApp({
            authController: modules.authController,
            usersController: modules.usersController,
            productsController: modules.productsController,
        }),
        close: () => modules.close(),
    };
}
