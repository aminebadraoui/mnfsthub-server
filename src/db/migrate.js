import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
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
        console.log('Running migrations...');

        await migrate(db, {
            migrationsFolder: './src/db/migrations',
        });

        console.log('Migrations completed successfully!');
    } catch (error) {
        console.error('Migration failed:', error);
        throw error;
    } finally {
        await pool.end();
    }
}

main().catch((err) => {
    console.error('Migration failed!', err);
    process.exit(1);
}); 