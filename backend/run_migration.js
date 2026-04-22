const fs = require('fs');
const db = require('./config/db');

const migrationSQL = fs.readFileSync('./migrations/create_temp_tokens.sql', 'utf8');

(async () => {
  try {
    await db.promise().query(migrationSQL);
    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
})();
