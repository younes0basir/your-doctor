// generate-token.js
const jwt = require('jsonwebtoken');
require('dotenv').config(); // Load .env

// Use the same secret as in your .env file
const secret = process.env.JWT_SECRET;
if (!secret) {
  console.error('JWT_SECRET not set in .env file!');
  process.exit(1);
}

// Usage: node generate-token.js doctor 1 "yassine@doctor.com"
//     or: node generate-token.js assistant 1 "yassine@assistant.com"

const [,, roleArg, idArg, emailArg] = process.argv;

if (!roleArg || !idArg || !emailArg) {
  console.log('Usage: node generate-token.js <role> <id> <email>');
  console.log('Example: node generate-token.js doctor 1 "yassine@doctor.com"');
  process.exit(1);
}

const role = roleArg.toLowerCase();
const id = parseInt(idArg, 10);
const email = emailArg;

if (!['doctor', 'assistant', 'admin'].includes(role)) {
  console.log('Role must be doctor, assistant, or admin');
  process.exit(1);
}

const payload = {
  id,
  email,
  role
};

const token = jwt.sign(payload, secret, { expiresIn: '7d' });
console.log(`${role.charAt(0).toUpperCase() + role.slice(1)} JWT token:`);
console.log(token);
