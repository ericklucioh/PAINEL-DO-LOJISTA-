import { config as loadEnv } from "dotenv";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@prisma/client";

loadEnv({ override: process.env.DOCKER_DEV !== "true" });

let prisma: PrismaClient | undefined;

function parseMysqlUrl(databaseUrl: string): {
    host: string;
    port?: number;
    user?: string;
    password?: string;
    database?: string;
    allowPublicKeyRetrieval: boolean;
    connectTimeout: number;
} {
    const url = new URL(databaseUrl);
    if (url.protocol !== "mysql:" && url.protocol !== "mariadb:") {
        throw new Error(
            "DATABASE_URL must use the mysql:// or mariadb:// protocol",
        );
    }

    const database = url.pathname.replace(/^\/+/, "") || undefined;
    const connectionOptions: {
        host: string;
        port?: number;
        user?: string;
        password?: string;
        database?: string;
        allowPublicKeyRetrieval: boolean;
        connectTimeout: number;
    } = {
        host: url.hostname,
        allowPublicKeyRetrieval: true,
        connectTimeout: 10000,
    };

    if (url.port) {
        connectionOptions.port = Number(url.port);
    }
    if (url.username) {
        connectionOptions.user = url.username;
    }
    if (url.password) {
        connectionOptions.password = url.password;
    }
    if (database) {
        connectionOptions.database = database;
    }

    return connectionOptions;
}

export function getPrisma(): PrismaClient {
    if (prisma === undefined) {
        const databaseUrl = process.env.DATABASE_URL?.trim();

        if (!databaseUrl) {
            throw new Error(
                "DATABASE_URL is required to initialize PrismaClient",
            );
        }

        const connectionOptions = parseMysqlUrl(databaseUrl);

        prisma = new PrismaClient({
            adapter: new PrismaMariaDb(connectionOptions),
        });
    }

    return prisma;
}
