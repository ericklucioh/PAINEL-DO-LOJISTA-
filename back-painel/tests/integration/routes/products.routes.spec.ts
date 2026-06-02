import { afterEach, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { createTestApp } from "../../helpers/create-test-app";
import { resetTestDatabase } from "../../helpers/test-database";
import { loginAs, bearer } from "../../helpers/test-http";

let testApp: ReturnType<typeof createTestApp>;

describe("products routes", () => {
    beforeEach(() => {
        resetTestDatabase();
        testApp = createTestApp();
    });

    afterEach(async () => {
        await testApp.close();
    });

    it("covers the happy path product flows", async () => {
        const admin = await loginAs(testApp.app, "admin@painel.com", "123456");
        const vendor = await loginAs(testApp.app, "joao@painel.com", "123456");

        const listResponse = await request(testApp.app)
            .get("/api/products")
            .set("Authorization", bearer(admin.accessToken))
            .query({ page: 1, search: "cola" })
            .expect(200);

        expect(listResponse.body).toMatchObject({
            page: 1,
            pageSize: 10,
            search: "cola",
            totalItems: 1,
            totalPages: 1,
            data: [
                expect.objectContaining({
                    id: "prod_001",
                    ean: "7891000100015",
                    name: "Refrigerante Cola 2L",
                    price: 12.9,
                    stockCurrent: 18,
                    isCritical: false,
                    isActive: true,
                }),
            ],
        });

        const byEanResponse = await request(testApp.app)
            .get("/api/products/by-ean/7891000100022")
            .set("Authorization", bearer(vendor.accessToken))
            .expect(200);

        expect(byEanResponse.body).toMatchObject({
            id: "prod_002",
            ean: "7891000100022",
            name: "Arroz 5kg",
            price: 29.9,
            stockCurrent: 7,
            isActive: true,
        });

        const createResponse = await request(testApp.app)
            .post("/api/products")
            .set("Authorization", bearer(admin.accessToken))
            .send({
                ean: "7891000100099",
                name: "Produto Novo",
                price: 14.5,
                minStock: 3,
                maxStock: 20,
            })
            .expect(201);

        expect(createResponse.body).toMatchObject({
            product: {
                ean: "7891000100099",
                name: "Produto Novo",
                price: 14.5,
                minStock: 3,
                maxStock: 20,
                deletedAt: null,
                isActive: true,
            },
        });

        const createdProductId = createResponse.body.product.id as string;

        const updateResponse = await request(testApp.app)
            .put(`/api/products/${createdProductId}`)
            .set("Authorization", bearer(admin.accessToken))
            .send({
                name: "Produto Novo Atualizado",
                price: 19.5,
            })
            .expect(200);

        expect(updateResponse.body).toMatchObject({
            product: {
                id: createdProductId,
                name: "Produto Novo Atualizado",
                price: 19.5,
            },
        });

        const deactivateResponse = await request(testApp.app)
            .patch(`/api/products/${createdProductId}/deactivate`)
            .set("Authorization", bearer(admin.accessToken))
            .expect(200);

        expect(deactivateResponse.body).toMatchObject({
            success: true,
            product: {
                id: createdProductId,
                deletedAt: expect.any(String),
            },
        });

        const persistedProduct = await testApp.prisma.product.findUnique({
            where: { id: createdProductId },
        });
        expect(persistedProduct).not.toBeNull();
        expect(persistedProduct?.deletedAt).not.toBeNull();
        expect(persistedProduct?.deactivatedAt).not.toBeNull();

        const inactiveLookup = await request(testApp.app)
            .get("/api/products/by-ean/7891000100099")
            .set("Authorization", bearer(vendor.accessToken));

        expect(inactiveLookup.statusCode).toBe(404);
        expect(inactiveLookup.body).toMatchObject({
            message: "Produto não disponível para venda",
        });

        const listAfterDeactivate = await request(testApp.app)
            .get("/api/products")
            .set("Authorization", bearer(admin.accessToken))
            .query({ page: 1, search: "Produto Novo" })
            .expect(200);

        expect(listAfterDeactivate.body.totalItems).toBe(0);
    });

    it("lists all active products without a search filter", async () => {
        const admin = await loginAs(testApp.app, "admin@painel.com", "123456");

        const response = await request(testApp.app)
            .get("/api/products")
            .set("Authorization", bearer(admin.accessToken))
            .query({ page: 1 })
            .expect(200);

        expect(response.body).toMatchObject({
            page: 1,
            pageSize: 10,
            totalItems: 4,
            totalPages: 1,
            data: expect.arrayContaining([
                expect.objectContaining({
                    id: "prod_001",
                    ean: "7891000100015",
                    name: "Refrigerante Cola 2L",
                    price: 12.9,
                    stockCurrent: 18,
                    minStock: 10,
                    maxStock: 80,
                    isCritical: false,
                    isActive: true,
                }),
                expect.objectContaining({
                    id: "prod_002",
                    ean: "7891000100022",
                    name: "Arroz 5kg",
                    price: 29.9,
                    stockCurrent: 7,
                    minStock: 12,
                    maxStock: 100,
                    isCritical: true,
                    isActive: true,
                }),
            ]),
        });
    });

    it("creates a critical product", async () => {
        const admin = await loginAs(testApp.app, "admin@painel.com", "123456");

        const response = await request(testApp.app)
            .post("/api/products")
            .set("Authorization", bearer(admin.accessToken))
            .send({
                ean: "7891000100099",
                name: "Sabao em Po 1kg",
                price: 21.9,
                minStock: 5,
                maxStock: 25,
            })
            .expect(201);

        expect(response.body).toMatchObject({
            product: {
                ean: "7891000100099",
                name: "Sabao em Po 1kg",
                price: 21.9,
                stockCurrent: 0,
                minStock: 5,
                maxStock: 25,
                isCritical: true,
                isActive: true,
                deletedAt: null,
            },
        });
    });

    it("updates only the product price", async () => {
        const admin = await loginAs(testApp.app, "admin@painel.com", "123456");

        const response = await request(testApp.app)
            .put("/api/products/prod_003")
            .set("Authorization", bearer(admin.accessToken))
            .send({
                price: 9.75,
            })
            .expect(200);

        expect(response.body).toMatchObject({
            product: {
                id: "prod_003",
                ean: "7891000100039",
                name: "Feijao Carioca 1kg",
                price: 9.75,
                stockCurrent: 24,
                minStock: 8,
                maxStock: 60,
                isCritical: false,
                isActive: true,
                deletedAt: null,
            },
        });
    });
});
