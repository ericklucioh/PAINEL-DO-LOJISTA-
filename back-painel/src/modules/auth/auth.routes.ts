import { Router } from "express";
import { verifyToken } from "../../middlewares/verifyToken";
import type { AuthController } from "./auth.controller";

export interface CreateAuthRouterDependencies {
    controller: AuthController;
}

export function createAuthRouter({
    controller,
}: CreateAuthRouterDependencies): Router {
    const router = Router();

    router.post("/login", controller.login);
    router.post("/refresh", controller.refresh);
    router.post("/logout", controller.logout);
    router.get("/me", verifyToken, controller.me);

    return router;
}
