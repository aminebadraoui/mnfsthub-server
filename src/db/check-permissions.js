const { Pool } = require('pg');
require('dotenv').config();

async function checkPermissions() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: false
    });

    try {
        console.log('Checking user permissions...');

        // Check current user and role memberships
        const roleQuery = await pool.query(`
            SELECT 
                r.rolname, 
                r.rolsuper,
                r.rolinherit,
                r.rolcreaterole,
                r.rolcreatedb,
                r.rolcanlogin,
                r.rolreplication
            FROM pg_roles r
            WHERE r.rolname = current_user;
        `);

        if (roleQuery.rows.length > 0) {
            const role = roleQuery.rows[0];
            console.log('\nUser role details:');
            console.log('- Username:', role.rolname);
            console.log('- Is superuser:', role.rolsuper);
            console.log('- Can create databases:', role.rolcreatedb);
            console.log('- Can create roles:', role.rolcreaterole);
            console.log('- Can login:', role.rolcanlogin);
        }

        // Check schema permissions
        const schemaPerms = await pool.query(`
            SELECT 
                n.nspname as schema,
                has_schema_privilege(current_user, n.nspname, 'CREATE') as create,
                has_schema_privilege(current_user, n.nspname, 'USAGE') as usage
            FROM pg_namespace n
            WHERE n.nspname NOT LIKE 'pg_%' 
            AND n.nspname != 'information_schema';
        `);

        console.log('\nSchema permissions:');
        schemaPerms.rows.forEach(perm => {
            console.log(`\nSchema: ${perm.schema}`);
            console.log('- Can create:', perm.create);
            console.log('- Can use:', perm.usage);
        });

    } catch (error) {
        console.error('Error checking permissions:', error);
    } finally {
        await pool.end();
    }
}

checkPermissions().catch(console.error); 