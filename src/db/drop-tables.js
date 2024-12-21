import { drizzle } from 'drizzle-orm/node-postgres';
import { sql } from 'drizzle-orm';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: false
});

const db = drizzle(pool);

async function main() {
    try {
        console.log('Dropping all tables...');

        await db.execute(sql`
            DROP TABLE IF EXISTS users, lists, campaigns, contacts CASCADE;
        `);

        console.log('Tables dropped successfully!');
    } catch (error) {
        console.error('Failed to drop tables:', error);
        throw error;
    } finally {
        await pool.end();
    }
}

main().catch((err) => {
    console.error('Failed to drop tables!', err);
    process.exit(1);
}); 