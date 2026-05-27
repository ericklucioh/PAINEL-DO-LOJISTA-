import { Router } from "express";
import type { ProductsController } from "./products.controller";

export interface CreateProductsRouterDependencies {
  controller: ProductsController;
}

export function createProductsRouter({
  controller,
}: CreateProductsRouterDependencies): Router {
  const router = Router();

  router.get("/", controller.list);
  router.get("/by-ean/:ean", controller.getByEan);
  router.post("/", controller.create);
  router.put("/:id", controller.update);
  router.patch("/:id/deactivate", controller.deactivate);

  return router;
}
