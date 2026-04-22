# PostgreSQL Migration - Quick Start Guide

## ✅ Migration Complete!

Your Doctor Appointment System has been successfully migrated from **MySQL** to **PostgreSQL (Neon DB)**.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd backend
npm install
```
✅ Already done! The `pg` package is now installed.

### 2. Set Up Database on Neon

You have two options:

#### Option A: Using psql command line
```bash
psql "postgresql://neondb_owner:npg_bsyVxo4r3eOf@ep-bitter-math-alkhkavp-pooler.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require" -f database_postgresql.sql
```

#### Option B: Using a GUI tool
1. Connect to your Neon database using pgAdmin, DBeaver, or DataGrip
2. Open and execute the file: `backend/database_postgresql.sql`
3. This will create all tables and insert initial data

### 3. Start the Server
```bash
npm start
```

You should see:
```
✅ Successfully connected to PostgreSQL database (Neon)
✅ Neon database connection successful.
Server is running on port 5000
```

---

## 📋 What Was Changed

### Files Modified:
- ✅ `package.json` - Replaced `mysql2` with `pg`
- ✅ `.env` - Updated with Neon PostgreSQL connection string
- ✅ `config/db.js` - Complete rewrite for PostgreSQL with MySQL compatibility layer
- ✅ `server.js` - Updated date functions and removed MySQL imports
- ✅ All route files in `routes/` - Converted 84 SQL queries from MySQL to PostgreSQL syntax

### Files Created:
- ✅ `database_postgresql.sql` - PostgreSQL schema with all tables
- ✅ `MIGRATION_GUIDE.md` - Detailed migration documentation
- ✅ `convert-queries.js` - Automated conversion script (for reference)
- ✅ `POSTGRESQL_MIGRATION.md` - This file

---

## 🔍 Key Differences

### SQL Syntax Changes

| Feature | MySQL | PostgreSQL |
|---------|-------|------------|
| Placeholders | `WHERE id = ?` | `WHERE id = $1` |
| Auto-increment | `AUTO_INCREMENT` | `SERIAL` |
| Get inserted ID | `result.insertId` | `RETURNING id` then `result[0].id` |
| Date extraction | `DATE(column)` | `column::date` |
| Week calculation | `YEARWEEK()` | `EXTRACT(WEEK FROM column)` |
| Boolean sum | `SUM(status = 'x')` | `SUM(CASE WHEN status = 'x' THEN 1 ELSE 0 END)` |

---

## 🧪 Testing

### Test Database Connection
The server automatically tests the connection on startup. Check the console output.

### Test API Endpoints
Try these endpoints:

1. **Health Check**: `GET http://localhost:5000/api/doctors/specialities`
2. **Login**: `POST http://localhost:5000/api/login`
   ```json
   {
     "email": "admin@admin.com",
     "password": "admin123"
   }
   ```

### Default Credentials
- **Admin**: admin@admin.com / admin123
- **Doctor**: yassine@doctor.com / doctor123 (check database for actual password)

---

## ⚠️ Important Notes

### 1. Manual Review Required
While 84 queries were automatically converted, you should manually review:
- Complex JOIN queries
- Subqueries
- Queries with multiple parameters
- Any query that fails during testing

### 2. Result Format
The compatibility layer converts PostgreSQL results to MySQL format:
```javascript
// Both work the same way now:
const [rows] = await db.promise().query('SELECT * FROM users');
// rows is an array of objects
```

### 3. INSERT Statements
All INSERT statements now use `RETURNING id`:
```javascript
// Before (MySQL)
const [result] = await db.promise().query('INSERT INTO...');
console.log(result.insertId);

// After (PostgreSQL)
const [result] = await db.promise().query('INSERT INTO... RETURNING id');
console.log(result[0].id);
```

---

## 🐛 Troubleshooting

### Error: "relation does not exist"
**Solution**: Run the `database_postgresql.sql` script to create tables.

### Error: "column does not exist"
**Solution**: Check column names are correct. PostgreSQL is case-sensitive for quoted identifiers.

### Error: SSL connection issues
**Solution**: Already configured in `config/db.js` with `ssl: { rejectUnauthorized: false }`

### Error: "invalid input syntax for type integer"
**Solution**: Ensure you're passing proper integers, not strings.

### Query returns empty results
**Solution**: Check that:
1. Tables have data
2. Query syntax is correct
3. Parameters are in the right order ($1, $2, etc.)

---

## 📚 Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Neon DB Docs](https://neon.tech/docs)
- [node-postgres (pg)](https://node-postgres.com/)
- [Detailed Migration Guide](./MIGRATION_GUIDE.md)

---

## 🎯 Next Steps

1. ✅ Database migration complete
2. ⏳ Test all features thoroughly
3. ⏳ Update any hardcoded SQL in frontend if exists
4. ⏳ Deploy to production with proper environment variables
5. ⏳ Set up database backups on Neon

---

## 💡 Pro Tips

1. **Use parameterized queries** - Already done! All queries use `$1, $2` placeholders
2. **Connection pooling** - Already configured with max 10 connections
3. **Error handling** - Add try-catch blocks around database operations
4. **Logging** - Enable query logging in development for debugging
5. **Indexes** - Review and add indexes for frequently queried columns

---

## 🔄 Rollback Plan

If you need to rollback to MySQL:

1. Restore `package.json` (change `pg` back to `mysql2`)
2. Restore `config/db.js` from backup
3. Restore `.env` with MySQL credentials
4. Run `npm install`
5. Use original `react.sql` for MySQL schema

---

**Migration completed on**: April 21, 2026  
**Total queries converted**: 84  
**Status**: ✅ Ready for testing
