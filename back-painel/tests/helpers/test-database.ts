import { execFileSync } from "node:child_process";
import { resolve } from "node:path";

const nodeBinary = process.execPath;
const resetScriptPath = resolve("prisma/test/reset.mjs");

function runCommand(binary: string, args: string[]): void {
    execFileSync(binary, args, {
        stdio: "inherit",
    });
}

export function resetTestDatabase(): void {
    runCommand(nodeBinary, [resetScriptPath]);
}
