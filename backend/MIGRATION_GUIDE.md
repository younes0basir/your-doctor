# PostgreSQL Migration Guide for Doctor Appointment System

## Overview
This project has been migrated from MySQL to PostgreSQL (Neon DB). Below are the key changes and what you need to know.

## Changes Made

### 1. Dependencies Updated
- **Removed**: `mysql2`
- **Added**: `pg` (PostgreSQL client)

### 2. Database Configuration (`config/db.js`)
- Changed from MySQL connection pool to PostgreSQL Pool
- Added compatibility layer to make PostgreSQL work with existing MySQL-style code
- Connection string now uses `DATABASE_URL` environment variable

### 3. Environment Variables (`.env`)
```env
# Old MySQL config (commented out)
# DB_HOST=localhost
# DB_USER=root
# DB_PASSWORD=
# DB_NAME=react

# New PostgreSQL config
DATABASE_URL=postgresql://neondb_owner:npg_bsyVxo4r3eOf@ep-bitter-math-alkhkavp-pooler.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require
```

### 4. Database Schema
- Created `database_postgresql.sql` with PostgreSQL-compatible schema
- Key differences from MySQL:
  - `SERIAL` instead of `AUTO_INCREMENT`
  - `CHECK` constraints instead of ENUM
  - `TIMESTAMP` with proper defaults
  - Triggers for `updatedAt` fields
  - Proper foreign key syntax with `REFERENCES`

### 5. SQL Query Syntax Changes

#### Placeholder Syntax
- **MySQL**: `WHERE id = ?`
- **PostgreSQL**: `WHERE id = $1`, `WHERE email = $1 AND age = $2`

#### INSERT with RETURNING
- **MySQL**: `INSERT INTO table (...) VALUES (...);` then use `result.insertId`
- **PostgreSQL**: `INSERT INTO table (...) VALUES (...) RETURNING id;` then use `result[0].id`

#### Date Functions
- **MySQL**: `DATE(column)`, `YEARWEEK()`, `CURDATE()`
- **PostgreSQL**: `column::date`, `EXTRACT(YEAR FROM column)`, `CURRENT_DATE`

#### Boolean/CASE Statements
- **MySQL**: `SUM(status = 'pending')`
- **PostgreSQL**: `SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END)`

#### String Quotes in SQL
- **MySQL**: Allows double quotes for strings
- **PostgreSQL**: Use single quotes for string literals in SQL

## What Still Needs Manual Review

While the database configuration is set up, you should review and update SQL queries in route files:

### Files to Check:
1. `routes/appointments.js`
2. `routes/adminRoutes.js`
3. `routes/doctorRoutes.js` (partially updated)
4. `routes/patientRoutes.js`
5. `routes/prescriptions.js`
6. `routes/assistantRoutes.js`
7. `routes/activity.js`
8. `routes/history.js`
9. `routes/specialityRoutes.js`
10. `routes/patientsDoctor.js`

### Quick Conversion Pattern:
```javascript
// Before (MySQL)
const [users] = await db.promise().query(
    'SELECT * FROM users WHERE email = ? AND age > ?',
    [email, minAge]
);

// After (PostgreSQL)
const [users] = await db.promise().query(
    'SELECT * FROM users WHERE email = $1 AND age > $2',
    [email, minAge]
);
```

## Setup Instructions

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Set Up Database
Connect to your Neon database and run:
```bash
psql "postgresql://neondb_owner:npg_bsyVxo4r3eOf@ep-bitter-math-alkhkavp-pooler.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require" -f database_postgresql.sql
```

Or use a GUI tool like pgAdmin, DBeaver, or DataGrip to execute `database_postgresql.sql`.

### 3. Start the Server
```bash
npm start
```

## Testing the Connection

The server will automatically test the database connection on startup. You should see:
```
✅ Successfully connected to PostgreSQL database (Neon)
✅ Neon database connection successful.
```

## Common Issues & Solutions

### Issue: "relation does not exist"
**Solution**: Make sure you've run the `database_postgresql.sql` script to create all tables.

### Issue: "column reference is ambiguous"
**Solution**: In JOIN queries, always prefix column names with table aliases (e.g., `d.id`, `p.email`).

### Issue: SSL connection errors
**Solution**: The configuration already includes `ssl: { rejectUnauthorized: false }` which is required for Neon.

### Issue: Date comparison not working
**Solution**: Use `::date` cast or `DATE()` function equivalent in PostgreSQL.

## Migration Checklist

- [x] Update package.json dependencies
- [x] Create PostgreSQL schema file
- [x] Update database configuration (db.js)
- [x] Update .env file with Neon connection string
- [x] Update server.js date functions
- [ ] Manually review and update all route files
- [ ] Test all API endpoints
- [ ] Verify authentication works
- [ ] Test appointment booking flow
- [ ] Test video consultation features
- [ ] Run integration tests

## Additional Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Neon Documentation](https://neon.tech/docs)
- [node-postgres (pg) Documentation](https://node-postgres.com/)
- [MySQL to PostgreSQL Migration Guide](https://wiki.postgresql.org/wiki/Converting_from_other_Databases_to_PostgreSQL#MySQL)

## Notes

The compatibility layer in `config/db.js` helps bridge some differences between MySQL and PostgreSQL, but it's not perfect. Manual review of complex queries is recommended.

For production deployment, consider:
1. Setting up proper SSL certificates
2. Using connection pooling at the database level
3. Implementing proper error handling and retry logic
4. Adding database migration tools like Knex.js or Sequelize
