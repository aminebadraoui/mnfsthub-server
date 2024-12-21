import pg from 'pg';
const { Pool } = pg;
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function testConnection() {
    try {
        const client = await pool.connect();
        console.log('Successfully connected to the database!');

        const dbResult = await client.query('SELECT current_database() as db_name');
        console.log(`Connected to database: ${dbResult.rows[0].db_name}`);

        // Check for tables
        const tableResult = await client.query(`
            SELECT tablename 
            FROM pg_tables 
            WHERE schemaname = 'public'
        `);

        console.log('\nTables in database:');
        if (tableResult.rows.length === 0) {
            console.log('No tables found');
        } else {
            tableResult.rows.forEach(row => {
                console.log(`- ${row.tablename}`);
            });
        }

        client.release();
    } catch (err) {
        console.error('Error connecting to the database:', err);
    } finally {
        await pool.end();
    }
}

testConnection(); 