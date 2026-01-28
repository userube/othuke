import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'

export default defineConfig({
    schema: 'prisma/schema.prisma',
    migrations: {
        path: 'prisma/migrations',
    },
    datasource: {
        // Use a dummy URL at build time to allow prisma generate to succeed
        url: "postgresql://dummy:dummy@localhost:5432/dummy",
    },
})
