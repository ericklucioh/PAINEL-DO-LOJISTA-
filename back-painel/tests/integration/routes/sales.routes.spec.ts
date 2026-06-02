import { afterEach, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { createTestApp } from "../../helpers/create-test-app";
import { resetTestDatabase } from "../../helpers/test-database";
import { loginAs, bearer } from "../../helpers/test-http";

let testApp: ReturnType<typeof createTestApp>;

describe("sales routes", () => {
    beforeEach(() => {
        resetTestDatabase();
        testApp = createTestApp();
    });

    afterEach(async () => {
        await testApp.close();
    });

    it("opens the register, creates the sale, prints the receipt and cancels it", async () => {
        const vendor = await loginAs(testApp.app, "joao@painel.com", "123456");

        const openResponse = await request(testApp.app)
            .post("/api/cash-registers/open")
            .set("Authorization", bearer(vendor.accessToken))
            .send({
                initialBalance: 200,
                note: "Abertura do PDV",
            });

        expect(openResponse.statusCode).toBe(201);

        const cashRegisterId = openResponse.body.cashRegister.id as string;

        const saleResponse = await request(testApp.app)
            .post("/api/sales")
            .set("Authorization", bearer(vendor.accessToken))
            .send({
                cashRegisterId,
                discountAmount: 5,
                paymentMethod: "DINHEIRO",
                items: [
                    { productId: "prod_001", quantity: 1 },
                    { productId: "prod_002", quantity: 2 },
                ],
            });

        expect(saleResponse.statusCode).toBe(201);
        expect(saleResponse.body).toMatchObject({
            sale: {
                cashRegisterId,
                soldByUserId: "user_vendor_1",
                soldByUserName: "Joao Vendedor",
                receiptNumber: "002",
                subtotal: 72.7,
                discountAmount: 5,
                totalAmount: 67.7,
                paymentMethod: "DINHEIRO",
                status: "CONFIRMED",
                items: expect.arrayContaining([
                    expect.objectContaining({
                        productId: "prod_001",
                        productNameSnapshot: "Refrigerante Cola 2L",
                        productEanSnapshot: "7891000100015",
                        quantity: 1,
                        unitPriceSnapshot: 12.9,
                        subtotal: 12.9,
                    }),
                    expect.objectContaining({
                        productId: "prod_002",
                        productNameSnapshot: "Arroz 5kg",
                        productEanSnapshot: "7891000100022",
                        quantity: 2,
                        unitPriceSnapshot: 29.9,
                        subtotal: 59.8,
                    }),
                ]),
            },
        });

        const saleId = saleResponse.body.sale.id as string;

        const printResponse = await request(testApp.app)
            .post("/api/print-receipt")
            .set("Authorization", bearer(vendor.accessToken))
            .send({
                saleId,
            });

        expect(printResponse.statusCode).toBe(200);
        expect(printResponse.body).toMatchObject({
            success: true,
            message: "Recibo impresso com sucesso",
            saleId,
        });

        const cancelResponse = await request(testApp.app)
            .delete(`/api/sales/${saleId}`)
            .set("Authorization", bearer(vendor.accessToken));

        expect(cancelResponse.statusCode).toBe(200);
        expect(cancelResponse.body).toMatchObject({
            saleId,
            status: "CANCELLED",
            reverted: true,
        });

        const persistedSale = await testApp.prisma.sale.findUnique({
            where: { id: saleId },
            include: {
                items: true,
                inventoryMovements: true,
                cashMovements: true,
            },
        });

        expect(persistedSale).not.toBeNull();
        expect(persistedSale?.status).toBe("CANCELADA");
        expect(persistedSale?.items.length).toBe(2);
        expect(persistedSale?.inventoryMovements.length).toBeGreaterThanOrEqual(
            2,
        );
        expect(persistedSale?.cashMovements.length).toBeGreaterThanOrEqual(1);
    });

    it("creates a sale with a single item and no discount", async () => {
        const vendor = await loginAs(testApp.app, "joao@painel.com", "123456");

        const openResponse = await request(testApp.app)
            .post("/api/cash-registers/open")
            .set("Authorization", bearer(vendor.accessToken))
            .send({
                initialBalance: 120,
                note: "Abertura simples",
            });

        expect(openResponse.statusCode).toBe(201);

        const saleResponse = await request(testApp.app)
            .post("/api/sales")
            .set("Authorization", bearer(vendor.accessToken))
            .send({
                cashRegisterId: openResponse.body.cashRegister.id,
                discountAmount: 0,
                paymentMethod: "DINHEIRO",
                items: [{ productId: "prod_003", quantity: 1 }],
            });

        expect(saleResponse.statusCode).toBe(201);
        expect(saleResponse.body).toMatchObject({
            sale: {
                cashRegisterId: openResponse.body.cashRegister.id,
                soldByUserId: "user_vendor_1",
                soldByUserName: "Joao Vendedor",
                receiptNumber: "002",
                subtotal: 8.5,
                discountAmount: 0,
                totalAmount: 8.5,
                paymentMethod: "DINHEIRO",
                status: "CONFIRMED",
                items: [
                    expect.objectContaining({
                        productId: "prod_003",
                        productNameSnapshot: "Feijao Carioca 1kg",
                        productEanSnapshot: "7891000100039",
                        quantity: 1,
                        unitPriceSnapshot: 8.5,
                        subtotal: 8.5,
                    }),
                ],
            },
        });
    });

    it("creates a sale with three items and a discount", async () => {
        const vendor = await loginAs(testApp.app, "joao@painel.com", "123456");

        const openResponse = await request(testApp.app)
            .post("/api/cash-registers/open")
            .set("Authorization", bearer(vendor.accessToken))
            .send({
                initialBalance: 300,
                note: "Abertura para venda variada",
            });

        expect(openResponse.statusCode).toBe(201);

        const saleResponse = await request(testApp.app)
            .post("/api/sales")
            .set("Authorization", bearer(vendor.accessToken))
            .send({
                cashRegisterId: openResponse.body.cashRegister.id,
                discountAmount: 3.5,
                paymentMethod: "DINHEIRO",
                items: [
                    { productId: "prod_001", quantity: 1 },
                    { productId: "prod_002", quantity: 1 },
                    { productId: "prod_004", quantity: 1 },
                ],
            });

        expect(saleResponse.statusCode).toBe(201);
        expect(saleResponse.body).toMatchObject({
            sale: {
                cashRegisterId: openResponse.body.cashRegister.id,
                soldByUserId: "user_vendor_1",
                soldByUserName: "Joao Vendedor",
                receiptNumber: "002",
                subtotal: 48.79,
                discountAmount: 3.5,
                totalAmount: 45.29,
                paymentMethod: "DINHEIRO",
                status: "CONFIRMED",
                items: expect.arrayContaining([
                    expect.objectContaining({
                        productId: "prod_001",
                        productNameSnapshot: "Refrigerante Cola 2L",
                        productEanSnapshot: "7891000100015",
                        quantity: 1,
                        unitPriceSnapshot: 12.9,
                        subtotal: 12.9,
                    }),
                    expect.objectContaining({
                        productId: "prod_002",
                        productNameSnapshot: "Arroz 5kg",
                        productEanSnapshot: "7891000100022",
                        quantity: 1,
                        unitPriceSnapshot: 29.9,
                        subtotal: 29.9,
                    }),
                    expect.objectContaining({
                        productId: "prod_004",
                        productNameSnapshot: "Leite Integral 1L",
                        productEanSnapshot: "7891000100046",
                        quantity: 1,
                        unitPriceSnapshot: 5.99,
                        subtotal: 5.99,
                    }),
                ]),
            },
        });
    });
});
