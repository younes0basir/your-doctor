const fs = require('fs');
const path = require('path');

const routesDir = path.join(__dirname, 'routes');

console.log('🔄 Starting MySQL to PostgreSQL Query Conversion...\n');

// Function to convert ? placeholders to $1, $2, etc. in SQL queries
function convertPlaceholders(sqlString) {
    let placeholderIndex = 0;
    let result = '';
    let i = 0;
    
    while (i < sqlString.length) {
        if (sqlString[i] === '?') {
            // Check if this is likely a SQL placeholder (not inside a JS string or comment)
            const before = sqlString.substring(Math.max(0, i - 20), i);
            const after = sqlString.substring(i + 1, Math.min(sqlString.length, i + 21));
            
            // Heuristic: if surrounded by SQL-like context
            if (before.match(/[\s=\(,]$/) && after.match(/^[\s,\)]/)) {
                placeholderIndex++;
                result += '$' + placeholderIndex;
            } else {
                result += '?';
            }
        } else {
            result += sqlString[i];
        }
        i++;
    }
    
    return { converted: result, count: placeholderIndex };
}

// Process each file
const files = fs.readdirSync(routesDir).filter(f => f.endsWith('.js'));
let totalConversions = 0;

files.forEach(file => {
    const filePath = path.join(routesDir, file);
    console.log(`Processing: ${file}`);
    
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    let fileConversions = 0;
    
    // Split into lines for processing
    const lines = content.split('\n');
    const processedLines = lines.map(line => {
        // Skip comments
        if (line.trim().startsWith('//') || line.trim().startsWith('*')) {
            return line;
        }
        
        // Look for SQL query patterns
        if ((line.includes('SELECT') || line.includes('INSERT') || 
             line.includes('UPDATE') || line.includes('DELETE') ||
             line.includes('WHERE') || line.includes('FROM')) &&
            line.includes('?')) {
            
            const result = convertPlaceholders(line);
            if (result.count > 0) {
                fileConversions += result.count;
                console.log(`  ✓ Converted ${result.count} placeholder(s)`);
                return result.converted;
            }
        }
        
        return line;
    });
    
    content = processedLines.join('\n');
    
    // Replace double quotes in SQL with single quotes (PostgreSQL standard)
    // Only for specific SQL patterns to avoid breaking JS strings
    content = content.replace(/SET (\w+) = "([^"]+)"/g, "SET $1 = '$2'");
    content = content.replace(/status = "(pending|confirmed|completed|canceled|in_progress)"/g, "status = '$1'");
    content = content.replace(/type = "(physical|video)"/g, "type = '$1'");
    content = content.replace(/role = "(doctor|admin|assistant|user)"/g, "role = '$1'");
    
    // Replace INSERT ... VALUES with RETURNING clause for tables that need it
    // This helps get the inserted ID
    content = content.replace(
        /INSERT INTO (doctor|patient|appointments|prescriptions|assistant|admin) \(([^)]+)\) VALUES \(([^)]+)\)(?!.*RETURNING)/gi,
        (match, table, columns, values) => {
            // Add RETURNING id if not already present
            if (!match.includes('RETURNING')) {
                return match + ' RETURNING id';
            }
            return match;
        }
    );
    
    // Replace result.insertId with result[0].id for PostgreSQL
    content = content.replace(/result\.insertId/g, 'result[0].id');
    content = content.replace(/results\.insertId/g, 'results[0].id');
    
    // Write back only if changed
    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`  ✅ File updated (${fileConversions} conversions)\n`);
        totalConversions += fileConversions;
    } else {
        console.log(`  ⏭️  No changes needed\n`);
    }
});

console.log('━'.repeat(60));
console.log(`✨ Conversion Complete! Total conversions: ${totalConversions}`);
console.log('━'.repeat(60));
console.log('\n⚠️  IMPORTANT: Please review the changes manually!');
console.log('Some complex queries may need additional adjustments.\n');
console.log('Next steps:');
console.log('1. Run: npm install (to install pg package)');
console.log('2. Execute database_postgresql.sql on your Neon database');
console.log('3. Test the application thoroughly');
