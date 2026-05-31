import { afterEach, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { createTestApp } from "../../helpers/create-test-app";
import { resetTestDatabase } from "../../helpers/test-database";

let testApp: ReturnType<typeof createTestApp>;

describe("auth routes", () => {
    beforeEach(() => {
        resetTestDatabase();
        testApp = createTestApp();
    });

    afterEach(async () => {
        await testApp.close();
    });

    it("logs in with valid credentials and returns tokens", async () => {
        const response = await request(testApp.app)
            .post("/api/auth/login")
            .send({
                email: "admin@painel.com",
                password: "123456",
            });

        expect(response.statusCode).toBe(200);
        expect(response.body).toMatchObject({
            accessToken: expect.any(String),
            refreshToken: expect.any(String),
            expiresIn: 900,
            user: {
                id: "user_admin_1",
                nome: "Admin do Sistema",
                tipo: "ADMIN",
            },
        });
        expect(response.headers["set-cookie"]).toBeUndefined();
    });

    it("rejects invalid credentials", async () => {
        const response = await request(testApp.app)
            .post("/api/auth/login")
            .send({
                email: "admin@painel.com",
                password: "senha-incorreta",
            });

        expect(response.statusCode).toBe(401);
        expect(response.body).toMatchObject({
            message: "Credenciais inválidas",
        });
    });

    it("refreshes the access token with a valid refresh token", async () => {
        const loginResponse = await request(testApp.app)
            .post("/api/auth/login")
            .send({
                email: "admin@painel.com",
                password: "123456",
            })
            .expect(200);

        const refreshResponse = await request(testApp.app)
            .post("/api/auth/refresh")
            .send({
                refreshToken: loginResponse.body.refreshToken,
            });

        expect(refreshResponse.statusCode).toBe(200);
        expect(refreshResponse.body).toMatchObject({
            accessToken: expect.any(String),
            refreshToken: expect.any(String),
            expiresIn: 900,
        });
        expect(refreshResponse.headers["set-cookie"]).toBeUndefined();
    });

    it("rejects refresh without a token", async () => {
        const response = await request(testApp.app).post("/api/auth/refresh");

        expect(response.statusCode).toBe(401);
        expect(response.body).toMatchObject({
            message: "Refresh token ausente",
        });
    });

    it("rejects protected routes without a token", async () => {
        const response = await request(testApp.app).get("/api/users");

        expect(response.statusCode).toBe(401);
        expect(response.body).toMatchObject({
            message: "Token ausente",
        });
    });

    it("rejects protected routes with an invalid token", async () => {
        const response = await request(testApp.app)
            .get("/api/users")
            .set("Authorization", "Bearer token-invalido");

        expect(response.statusCode).toBe(401);
        expect(response.body).toMatchObject({
            message: "Token inválido",
        });
    });
});
