import bcrypt from 'bcryptjs';

const password = 'admin123';
const hash = await bcrypt.hash(password, 10);

console.log('Password:', password);
console.log('Hash:', hash);
console.log('\nRun this SQL query:');
console.log(`UPDATE users SET password = '${hash}' WHERE email = 'admin@marketplace.com';`);

process.exit(0);
