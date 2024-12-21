import pg from 'pg';
const { Pool } = pg;
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function inspectSchema() {
    try {
        const client = await pool.connect();

        // Get all tables
        const tableQuery = `
            SELECT 
                tablename as table_name,
                pg_size_pretty(pg_total_relation_size(quote_ident(tablename))) as table_size
            FROM pg_tables
            WHERE schemaname = 'public'
            ORDER BY tablename;
        `;
        const tables = await client.query(tableQuery);

        console.log('Database Schema:');
        console.log('================\n');

        // For each table, get its columns and constraints
        for (const table of tables.rows) {
            console.log(`Table: ${table.table_name}`);
            console.log(`Size: ${table.table_size}`);
            console.log('-'.repeat(50));

            // Get columns
            const columnQuery = `
                SELECT 
                    c.column_name, 
                    c.data_type, 
                    c.is_nullable,
                    c.column_default,
                    c.character_maximum_length,
                    tc.constraint_type
                FROM information_schema.columns c
                LEFT JOIN information_schema.constraint_column_usage ccu 
                    ON c.table_name = ccu.table_name 
                    AND c.column_name = ccu.column_name
                LEFT JOIN information_schema.table_constraints tc
                    ON tc.constraint_name = ccu.constraint_name
                WHERE c.table_schema = 'public'
                AND c.table_name = $1
                ORDER BY c.ordinal_position;
            `;
            const columns = await client.query(columnQuery, [table.table_name]);

            console.log('Columns:');
            columns.rows.forEach(column => {
                let details = [];
                if (column.constraint_type === 'PRIMARY KEY') details.push('PRIMARY KEY');
                if (column.constraint_type === 'FOREIGN KEY') details.push('FOREIGN KEY');
                if (column.is_nullable === 'NO') details.push('NOT NULL');
                if (column.column_default) details.push(`DEFAULT: ${column.column_default}`);
                if (column.character_maximum_length) details.push(`LENGTH: ${column.character_maximum_length}`);

                console.log(`  ${column.column_name}`);
                console.log(`    Type: ${column.data_type}`);
                if (details.length > 0) {
                    console.log(`    ${details.join(', ')}`);
                }
                console.log('');
            });

            // Get foreign key relationships
            const fkQuery = `
                SELECT
                    kcu.column_name,
                    ccu.table_name AS foreign_table_name,
                    ccu.column_name AS foreign_column_name
                FROM 
                    information_schema.table_constraints AS tc 
                    JOIN information_schema.key_column_usage AS kcu
                      ON tc.constraint_name = kcu.constraint_name
                      AND tc.table_schema = kcu.table_schema
                    JOIN information_schema.constraint_column_usage AS ccu
                      ON ccu.constraint_name = tc.constraint_name
                      AND ccu.table_schema = tc.table_schema
                WHERE tc.constraint_type = 'FOREIGN KEY'
                AND tc.table_name = $1;
            `;
            const fks = await client.query(fkQuery, [table.table_name]);

            if (fks.rows.length > 0) {
                console.log('Foreign Keys:');
                fks.rows.forEach(fk => {
                    console.log(`  ${fk.column_name} -> ${fk.foreign_table_name}(${fk.foreign_column_name})`);
                });
                console.log('');
            }

            console.log('\n');
        }

        client.release();
    } catch (err) {
        console.error('Error inspecting schema:', err);
    } finally {
        await pool.end();
    }
}

inspectSchema(); 