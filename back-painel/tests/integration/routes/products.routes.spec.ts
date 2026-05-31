import { describe, expect, it } from "vitest";
import {
    createUsersControllerMock,
    createProductsControllerMock,
} from "../../helpers/controllers";
import { createProductsRouter } from "../../../src/modules/products/products.routes";

describe("products routes", () => {
    it("registers protected product routes", () => {
        const router = createProductsRouter({
            controller: createProductsControllerMock(),
        });

        const routes = router.stack
            .filter((layer) => layer.route !== undefined)
            .map((layer) => ({
                path: layer.route?.path,
                methods: Object.keys(layer.route?.methods ?? {}),
                stack: layer.route?.stack.map((routeLayer) => routeLayer.name),
            }));

        expect(routes).toHaveLength(5);
        expect(routes).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    path: "/",
                    methods: ["get"],
                    stack: expect.arrayContaining(["verifyToken", "Mock"]),
                }),
                expect.objectContaining({
                    path: "/by-ean/:ean",
                    methods: ["get"],
                    stack: expect.arrayContaining(["verifyToken", "Mock"]),
                }),
                expect.objectContaining({
                    path: "/",
                    methods: ["post"],
                    stack: expect.arrayContaining(["verifyToken", "Mock"]),
                }),
                expect.objectContaining({
                    path: "/:id",
                    methods: ["put"],
                    stack: expect.arrayContaining(["verifyToken", "Mock"]),
                }),
                expect.objectContaining({
                    path: "/:id/deactivate",
                    methods: ["patch"],
                    stack: expect.arrayContaining(["verifyToken", "Mock"]),
                }),
            ]),
        );
    });
});
