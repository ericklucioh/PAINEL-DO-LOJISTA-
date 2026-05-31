import { describe, expect, it } from "vitest";
import { createUsersControllerMock } from "../../helpers/controllers";
import { createUsersRouter } from "../../../src/modules/users/users.routes";

describe("users routes", () => {
    it("registers admin-only user routes", () => {
        const router = createUsersRouter({
            controller: createUsersControllerMock(),
        });

        const routes = router.stack
            .filter((layer) => layer.route !== undefined)
            .map((layer) => ({
                path: layer.route?.path,
                methods: Object.keys(layer.route?.methods ?? {}),
                stack: layer.route?.stack.map((routeLayer) => routeLayer.name),
            }));

        expect(router.stack[0]?.route).toBeUndefined();
        expect(routes).toEqual([
            { path: "/", methods: ["get"], stack: ["Mock"] },
            { path: "/", methods: ["post"], stack: ["Mock"] },
            { path: "/:id", methods: ["put"], stack: ["Mock"] },
            { path: "/:id/deactivate", methods: ["patch"], stack: ["Mock"] },
        ]);
    });
});
