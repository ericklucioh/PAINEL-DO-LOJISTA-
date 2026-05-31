import { NextResponse } from "next/server";
import {
    ACCESS_TOKEN_COOKIE_NAME,
    ACCESS_TOKEN_MAX_AGE_SECONDS,
    REFRESH_TOKEN_COOKIE_NAME,
    REFRESH_TOKEN_MAX_AGE_SECONDS,
} from "@/lib/auth-config";

export function setAuthCookies(
    response: NextResponse,
    accessToken: string,
    refreshToken: string,
): void {
    response.cookies.set(ACCESS_TOKEN_COOKIE_NAME, accessToken, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: ACCESS_TOKEN_MAX_AGE_SECONDS,
    });
    response.cookies.set(REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: REFRESH_TOKEN_MAX_AGE_SECONDS,
    });
}

export function clearAuthCookies(response: NextResponse): void {
    response.cookies.set(ACCESS_TOKEN_COOKIE_NAME, "", {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 0,
    });
    response.cookies.set(REFRESH_TOKEN_COOKIE_NAME, "", {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 0,
    });
}

export function buildAuthCookieHeader(
    accessToken: string,
    refreshToken: string,
): string {
    return `${ACCESS_TOKEN_COOKIE_NAME}=${encodeURIComponent(accessToken)}; ${REFRESH_TOKEN_COOKIE_NAME}=${encodeURIComponent(refreshToken)}`;
}

export function readCookieValue(
    cookieHeader: string | null,
    cookieName: string,
): string | null {
    if (!cookieHeader) {
        return null;
    }

    const entries = cookieHeader.split(";").map((entry) => entry.trim());
    const match = entries.find((entry) => entry.startsWith(`${cookieName}=`));

    if (!match) {
        return null;
    }

    return decodeURIComponent(match.slice(cookieName.length + 1));
}
