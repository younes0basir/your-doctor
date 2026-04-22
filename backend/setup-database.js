const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

console.log('🚀 Setting up PostgreSQL Database on Neon...\n');

// Read the SQL file
const sqlFilePath = path.join(__dirname, 'database_postgresql.sql');
let sqlContent;

try {
    sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    console.log('✅ Loaded database_postgresql.sql');
} catch (error) {
    console.error('❌ Error reading SQL file:', error.message);
    process.exit(1);
}

// Create a connection pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_bsyVxo4r3eOf@ep-bitter-math-alkhkavp-pooler.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require',
    ssl: {
        rejectUnauthorized: false
    }
});

async function setupDatabase() {
    let client;
    
    try {
        console.log('📡 Connecting to Neon database...');
        client = await pool.connect();
        console.log('✅ Connected successfully\n');

        // Read and execute the entire SQL file as one batch
        console.log('📝 Executing database schema...\n');
        
        await client.query(sqlContent);
        
        console.log('✅ Schema executed successfully!\n');
        
        // Verify tables were created
        console.log('🔍 Verifying tables...');
        const result = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name
        `);
        
        console.log(`\n✅ Created ${result.rows.length} tables:`);
        result.rows.forEach(row => {
            console.log(`   - ${row.table_name}`);
        });
        
        console.log('\n✨ Your database is ready to use!');
        console.log('\nNext steps:');
        console.log('1. Run: node test-migration.js (to verify)');
        console.log('2. Run: npm start (to start the server)');

    } catch (error) {
        console.error('\n❌ Error during setup:', error.message);
        console.error('\nFull error:', error);
        process.exit(1);
    } finally {
        if (client) {
            client.release();
        }
        await pool.end();
    }
}

setupDatabase();
