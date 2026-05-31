import { afterEach, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { createTestApp } from "../../helpers/create-test-app";
import { resetTestDatabase } from "../../helpers/test-database";
import { loginAs, bearer } from "../../helpers/test-http";

let testApp: ReturnType<typeof createTestApp>;

describe("stock routes", () => {
    beforeEach(() => {
        resetTestDatabase();
        testApp = createTestApp();
    });

    afterEach(async () => {
        await testApp.close();
    });

    it("records incoming and outgoing stock movements and returns history", async () => {
        const admin = await loginAs(testApp.app, "admin@painel.com", "123456");

        const entryResponse = await request(testApp.app)
            .post("/api/stock/entry")
            .set("Authorization", bearer(admin.accessToken))
            .send({
                productId: "prod_001",
                quantity: 5,
                reason: "COMPRA",
                note: "Reposição",
            });

        expect(entryResponse.statusCode).toBe(201);
        expect(entryResponse.body).toMatchObject({
            movement: {
                type: "ENTRY",
                reason: "COMPRA",
                quantity: 5,
                balanceAfter: 23,
            },
        });

        const exitResponse = await request(testApp.app)
            .post("/api/stock/exit")
            .set("Authorization", bearer(admin.accessToken))
            .send({
                productId: "prod_001",
                quantity: 2,
                reason: "PERDA",
                note: "Avaria",
            });

        expect(exitResponse.statusCode).toBe(201);
        expect(exitResponse.body).toMatchObject({
            movement: {
                type: "EXIT",
                reason: "PERDA",
                quantity: 2,
                balanceAfter: 21,
            },
        });

        const historyResponse = await request(testApp.app)
            .get("/api/stock/history")
            .set("Authorization", bearer(admin.accessToken))
            .query({ produto_id: "prod_001" });

        expect(historyResponse.statusCode).toBe(200);
        expect(historyResponse.body).toMatchObject({
            product: {
                id: "prod_001",
                ean: "7891000100015",
                name: "Refrigerante Cola 2L",
            },
            data: expect.arrayContaining([
                expect.objectContaining({
                    type: "ENTRY",
                    quantity: 5,
                    balanceAfter: 23,
                }),
                expect.objectContaining({
                    type: "EXIT",
                    quantity: 2,
                    balanceAfter: 21,
                }),
            ]),
        });

        const persistedMovements = await testApp.prisma.inventoryMovement.findMany({
            where: { productId: "prod_001" },
        });
        expect(persistedMovements.length).toBeGreaterThanOrEqual(10);
    });
});
