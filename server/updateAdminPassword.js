import { query } from './config/database.js';
import bcrypt from 'bcryptjs';

const updateAdminPassword = async () => {
  try {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const email = 'admin@marketplace.com';

    const result = await query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE email = $2 RETURNING id, email, role',
      [hashedPassword, email]
    );

    if (result.rows.length === 0) {
      console.log(`❌ No user found with email: ${email}`);
      console.log('First, you need to create an admin user. Run the database schema initialization.');
      process.exit(1);
    }

    console.log('✅ Admin password updated successfully!');
    console.log('Updated user:', result.rows[0]);
    console.log('\nYou can now login with:');
    console.log('Email: admin@marketplace.com');
    console.log('Password: admin123');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating password:', error.message);
    process.exit(1);
  }
};

updateAdminPassword();
