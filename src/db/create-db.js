const { Pool } = require('pg');
require('dotenv').config();

async function createDatabase() {
    // Connect to the default 'postgres' database first
    const pool = new Pool({
        host: '143.198.172.101',
        port: 5432,
        user: 'contact@mnfstai.com',
        password: 'invictus',
        database: 'postgres',
        ssl: false
    });

    try {
        // Create the new database
        await pool.query('CREATE DATABASE mnfsthub');
        console.log('Database created successfully');
    } catch (error) {
        if (error.code === '42P04') {
            console.log('Database already exists, proceeding...');
        } else {
            console.error('Error creating database:', error);
        }
    } finally {
        await pool.end();
    }
}

createDatabase().catch(console.error); 