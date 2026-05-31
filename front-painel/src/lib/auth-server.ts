import "server-only";

import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE_NAME } from "@/lib/auth-config";
import { fetchCurrentUserOnBackend } from "@/lib/auth-backend";

export type AuthSession = {
    id: string;
    nome: string;
    tipo: "ADMIN" | "VENDEDOR";
};

export async function getCurrentAuthSession(): Promise<AuthSession | null> {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE_NAME)?.value;

    if (!accessToken) {
        return null;
    }

    const response = await fetchCurrentUserOnBackend(accessToken);
    if (!response.ok || !response.data) {
        return null;
    }

    return response.data;
}
