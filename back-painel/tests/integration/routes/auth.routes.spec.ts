import { describe, expect, it } from "vitest";
import { createAuthControllerMock } from "../../helpers/controllers";
import { createAuthRouter } from "../../../src/modules/auth/auth.routes";

describe("auth routes", () => {
    it("registers login and refresh routes", () => {
        const router = createAuthRouter({
            controller: createAuthControllerMock(),
        });

        const routes = router.stack
            .filter((layer) => layer.route !== undefined)
            .map((layer) => ({
                path: layer.route?.path,
                methods: Object.keys(layer.route?.methods ?? {}),
            }));

        expect(routes).toEqual([
            { path: "/login", methods: ["post"] },
            { path: "/refresh", methods: ["post"] },
        ]);
    });
});
