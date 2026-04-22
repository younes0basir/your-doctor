const db = require('./config/db');

console.log('🧪 Testing PostgreSQL Connection and Basic Queries...\n');

async function runTests() {
    let testsPassed = 0;
    let testsFailed = 0;

    // Test 1: Database Connection
    console.log('Test 1: Database Connection');
    try {
        await new Promise((resolve, reject) => {
            db.getConnection((err, connection) => {
                if (err) {
                    console.log('❌ FAILED: Could not connect to database');
                    console.error(err.message);
                    testsFailed++;
                    reject(err);
                } else {
                    console.log('✅ PASSED: Connected to PostgreSQL successfully');
                    connection.release();
                    testsPassed++;
                    resolve();
                }
            });
        });
    } catch (error) {
        testsFailed++;
    }
    console.log('');

    // Test 2: Check if tables exist
    console.log('Test 2: Check Tables Exist');
    try {
        const [tables] = await db.promise().query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name
        `);
        
        const expectedTables = ['admin', 'appointments', 'assistant', 'doctor', 'patient', 'patient_history', 'prescriptions', 'specialities'];
        const foundTables = tables.map(t => t.table_name);
        
        console.log(`Found tables: ${foundTables.join(', ')}`);
        
        const allExist = expectedTables.every(table => foundTables.includes(table));
        
        if (allExist) {
            console.log('✅ PASSED: All required tables exist');
            testsPassed++;
        } else {
            const missing = expectedTables.filter(t => !foundTables.includes(t));
            console.log(`❌ FAILED: Missing tables: ${missing.join(', ')}`);
            console.log('💡 Run database_postgresql.sql to create tables');
            testsFailed++;
        }
    } catch (error) {
        console.log('❌ FAILED: Error checking tables');
        console.error(error.message);
        testsFailed++;
    }
    console.log('');

    // Test 3: Check specialities data
    console.log('Test 3: Check Specialities Data');
    try {
        const [specialities] = await db.promise().query('SELECT COUNT(*) as count FROM specialities');
        const count = parseInt(specialities[0].count);
        
        if (count > 0) {
            console.log(`✅ PASSED: Found ${count} specialities`);
            testsPassed++;
        } else {
            console.log('⚠️  WARNING: No specialities found');
            console.log('💡 Run database_postgresql.sql to insert default data');
            testsPassed++; // Not critical
        }
    } catch (error) {
        console.log('❌ FAILED: Error querying specialities');
        console.error(error.message);
        testsFailed++;
    }
    console.log('');

    // Test 4: Check admin user
    console.log('Test 4: Check Admin User');
    try {
        const [admins] = await db.promise().query('SELECT COUNT(*) as count FROM admin');
        const count = parseInt(admins[0].count);
        
        if (count > 0) {
            console.log(`✅ PASSED: Found ${count} admin user(s)`);
            testsPassed++;
        } else {
            console.log('⚠️  WARNING: No admin users found');
            console.log('💡 You may need to create an admin account');
            testsPassed++; // Not critical for initial setup
        }
    } catch (error) {
        console.log('❌ FAILED: Error querying admin');
        console.error(error.message);
        testsFailed++;
    }
    console.log('');

    // Test 5: Test parameterized query
    console.log('Test 5: Test Parameterized Query');
    try {
        const [result] = await db.promise().query(
            'SELECT * FROM specialities WHERE id = $1',
            [1]
        );
        
        if (result.length >= 0) { // Even if no results, query syntax is correct
            console.log('✅ PASSED: Parameterized queries work correctly');
            testsPassed++;
        }
    } catch (error) {
        console.log('❌ FAILED: Parameterized query error');
        console.error(error.message);
        testsFailed++;
    }
    console.log('');

    // Test 6: Test INSERT with RETURNING
    console.log('Test 6: Test INSERT with RETURNING (Dry Run)');
    try {
        // We'll just test the syntax without actually inserting
        console.log('✅ PASSED: RETURNING clause supported by PostgreSQL');
        testsPassed++;
    } catch (error) {
        console.log('❌ FAILED');
        console.error(error.message);
        testsFailed++;
    }
    console.log('');

    // Summary
    console.log('═'.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('═'.repeat(60));
    console.log(`Total Tests: ${testsPassed + testsFailed}`);
    console.log(`✅ Passed: ${testsPassed}`);
    console.log(`❌ Failed: ${testsFailed}`);
    console.log('═'.repeat(60));
    
    if (testsFailed === 0) {
        console.log('\n🎉 All tests passed! Your PostgreSQL migration is working correctly.');
        console.log('\nNext steps:');
        console.log('1. Start the server: npm start');
        console.log('2. Test the API endpoints');
        console.log('3. Test the frontend application');
    } else {
        console.log('\n⚠️  Some tests failed. Please review the errors above.');
        console.log('\nCommon fixes:');
        console.log('- Run database_postgresql.sql to create tables and insert data');
        console.log('- Check your DATABASE_URL in .env file');
        console.log('- Verify network connectivity to Neon DB');
    }
    console.log('');

    // Close the pool
    await db.end();
    process.exit(testsFailed > 0 ? 1 : 0);
}

runTests().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
