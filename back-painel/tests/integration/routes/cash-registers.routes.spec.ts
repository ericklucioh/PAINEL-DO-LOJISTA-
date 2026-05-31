import { afterEach, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { createTestApp } from "../../helpers/create-test-app";
import { resetTestDatabase } from "../../helpers/test-database";
import { loginAs, bearer } from "../../helpers/test-http";

let testApp: ReturnType<typeof createTestApp>;

describe("cash-registers routes", () => {
    beforeEach(() => {
        resetTestDatabase();
        testApp = createTestApp();
    });

    afterEach(async () => {
        await testApp.close();
    });

    it("opens a cash register for the seller flow", async () => {
        const vendor = await loginAs(testApp.app, "joao@painel.com", "123456");

        const response = await request(testApp.app)
            .post("/api/cash-registers/open")
            .set("Authorization", bearer(vendor.accessToken))
            .send({
                saldo_inicial: 150,
                observacao: "Abertura do PDV",
            });

        expect(response.statusCode).toBe(201);
        expect(response.body).toMatchObject({
            cashRegister: {
                openedByUserId: "user_vendor_1",
                activeOpenedByUserId: "user_vendor_1",
                initialBalance: 150,
                status: "ABERTO",
            },
        });
    });
});
