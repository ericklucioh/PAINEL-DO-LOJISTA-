import express, { type Express } from "express";
import cors from "cors";
import { errorHandler } from "./middlewares/errorHandler";
import { createProductsRouter } from "./modules/products/products.routes";
import { createProductsService } from "./modules/products/products.service";
import { createProductsController } from "./modules/products/products.controller";

export function createApp(): Express {
  const app = express();

  app.use(cors());
  app.use(express.json());

  const productsService = createProductsService();
  const productsController = createProductsController({
    service: productsService,
  });

  app.get("/health", (_req, res) => {
    res.status(200).json({ ok: true });
  });

  app.use("/api/products", createProductsRouter({ controller: productsController }));

  app.use(errorHandler);

  return app;
}
