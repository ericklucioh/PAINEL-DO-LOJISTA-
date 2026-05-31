import { defineConfig } from "prisma/config";

export default defineConfig({
    schema: "test/schema.prisma",
    datasource: {
        url: "file:./test/test.db",
    },
});
