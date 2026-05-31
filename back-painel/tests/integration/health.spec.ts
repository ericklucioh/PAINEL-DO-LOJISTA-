import { describe, expect, it } from "vitest";
import { createTestApp } from "../helpers/create-test-app";

describe("health route", () => {
    it("registers GET /health", () => {
        const app = createTestApp();
        const healthRoute = app.router.stack.find(
            (layer) => layer.route?.path === "/health",
        );

        expect(healthRoute?.route?.methods.get).toBe(true);
    });
});
