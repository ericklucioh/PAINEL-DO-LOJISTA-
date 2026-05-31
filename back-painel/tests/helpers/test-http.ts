import type { Express } from "express";
import request from "supertest";

export interface LoginResult {
    accessToken: string;
    refreshToken: string;
    cookies: string[];
}

export async function loginAs(
    app: Express,
    email: string,
    password: string,
): Promise<LoginResult> {
    const response = await request(app)
        .post("/api/auth/login")
        .send({ email, password })
        .expect(200);

    return {
        accessToken: response.body.accessToken as string,
        refreshToken: response.body.refreshToken as string,
        cookies: response.headers["set-cookie"] ?? [],
    };
}

export function bearer(accessToken: string): string {
    return `Bearer ${accessToken}`;
}
