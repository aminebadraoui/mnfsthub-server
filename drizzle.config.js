import dotenv from 'dotenv';

dotenv.config();

/** @type { import("drizzle-kit").Config } */
export default {
    schema: './src/db/schema/*.js',
    out: './src/db/migrations',
    driver: 'pg',
    dbCredentials: {
        connectionString: process.env.DATABASE_URL,
    },
    strict: true,
}; 