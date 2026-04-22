const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_bsyVxo4r3eOf@ep-bitter-math-alkhkavp-pooler.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require',
    ssl: { rejectUnauthorized: false }
});

async function checkColumns() {
    let client;
    try {
        client = await pool.connect();
        
        // Check doctor table columns
        const result = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'doctor' 
            AND column_name LIKE '%name%'
            ORDER BY column_name
        `);
        
        console.log('Doctor table name columns:');
        result.rows.forEach(row => {
            console.log(`  - ${row.column_name}`);
        });
        
        // Get all columns
        const allCols = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'doctor' 
            ORDER BY ordinal_position
        `);
        
        console.log('\nAll doctor table columns:');
        allCols.rows.forEach(row => {
            console.log(`  - ${row.column_name} (${row.data_type})`);
        });
        
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        if (client) client.release();
        await pool.end();
    }
}

checkColumns();
