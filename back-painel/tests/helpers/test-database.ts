import { execFileSync } from "node:child_process";
import { resolve } from "node:path";

const prismaBinary = resolve("node_modules/.bin/prisma");
const nodeBinary = process.execPath;

function runCommand(binary: string, args: string[]): void {
    execFileSync(binary, args, {
        stdio: "inherit",
    });
}

export function resetTestDatabase(): void {
    runCommand(prismaBinary, [
        "db",
        "push",
        "--force-reset",
        "--config",
        "prisma/test.config.ts",
    ]);
    runCommand(nodeBinary, ["prisma/test/seed.mjs"]);
}
