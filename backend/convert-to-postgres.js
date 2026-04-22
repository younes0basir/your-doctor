const fs = require('fs');
const path = require('path');

const routesDir = path.join(__dirname, 'routes');

// Function to convert MySQL ? placeholders to PostgreSQL $1, $2, etc.
function convertQueryPlaceholders(content) {
    let result = content;
    let placeholderCount = 0;
    
    // Process each line to find SQL queries with ? placeholders
    const lines = result.split('\n');
    const convertedLines = lines.map(line => {
        // Skip if it's a comment or doesn't contain SQL-like patterns
        if (line.trim().startsWith('//') || line.trim().startsWith('*')) {
            return line;
        }
        
        // Check if line contains query patterns with ?
        if (line.includes('?') && (
            line.includes('SELECT') || 
            line.includes('INSERT') || 
            line.includes('UPDATE') || 
            line.includes('DELETE') ||
            line.includes('WHERE') ||
            line.includes('FROM') ||
            line.includes('query(')
        )) {
            // Count and replace ? with $1, $2, etc.
            let newLine = line;
            let count = 0;
            
            // Find all ? that are not inside strings
            const parts = newLine.split('?');
            if (parts.length > 1) {
                newLine = parts.map((part, index) => {
                    if (index === parts.length - 1) return part;
                    // Check if this ? is likely a placeholder (not inside a string)
                    const beforeQuestion = part.trim();
                    const afterQuestion = parts[index + 1]?.trim();
                    
                    // Simple heuristic: if surrounded by spaces or operators, it's a placeholder
                    if (beforeQuestion.match(/[=\s(,]$/) && afterQuestion.match(/^[\s),]/)) {
                        count++;
                        return part + '$' + count;
                    }
                    return part + '?';
                }).join('');
                
                if (count > 0) {
                    console.log(`  Converted ${count} placeholder(s) in: ${line.trim().substring(0, 60)}...`);
                }
            }
            
            return newLine;
        }
        
        return line;
    });
    
    return convertedLines.join('\n');
}

// Process all .js files in routes directory
const files = fs.readdirSync(routesDir).filter(f => f.endsWith('.js'));

console.log('Converting MySQL queries to PostgreSQL syntax...\n');

files.forEach(file => {
    const filePath = path.join(routesDir, file);
    console.log(`Processing: ${file}`);
    
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Convert query placeholders
    content = convertQueryPlaceholders(content);
    
    // Replace double quotes with single quotes for string literals in SQL (PostgreSQL preference)
    // But be careful not to break JavaScript strings
    // This is a simple replacement for SQL-specific patterns
    content = content.replace(/SET\s+(\w+)\s*=\s*"([^"]+)"/g, 'SET $1 = \'$2\'');
    content = content.replace(/status\s*=\s*"([^"]+)"/g, "status = '$1'");
    
    // Only write if changes were made
    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`  ✓ Updated ${file}\n`);
    } else {
        console.log(`  - No changes needed\n`);
    }
});

console.log('Conversion complete!');
console.log('\nNote: Please review the changes manually as automatic conversion may not catch all edge cases.');
