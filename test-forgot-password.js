import pkg from 'pg';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pkg;

const db = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'MernEccomerce',
  password: 'Manoj@123@',
  port: 5432,
});

async function testForgotPassword() {
  try {
    await db.connect();
    console.log('✅ Connected to database');

    // Check existing users
    const users = await db.query('SELECT email, name, role FROM users LIMIT 5');
    console.log('\n📋 Existing users:');
    users.rows.forEach(user => {
      console.log(`  - ${user.email} (${user.name}) - ${user.role}`);
    });

    // Create a test user if none exist
    if (users.rows.length === 0) {
      console.log('\n⚠️  No users found. Creating test user...');
      const hashedPassword = await bcrypt.hash('test123', 10);
      
      await db.query(
        'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)',
        ['Test User', 'test@example.com', hashedPassword, 'User']
      );
      
      console.log('✅ Test user created: test@example.com / test123');
    }

    // Test forgot password functionality
    console.log('\n🔍 Testing forgot password for first user...');
    const testEmail = users.rows.length > 0 ? users.rows[0].email : 'test@example.com';
    
    const userCheck = await db.query('SELECT * FROM users WHERE email = $1', [testEmail]);
    
    if (userCheck.rows.length > 0) {
      console.log(`✅ User found: ${testEmail}`);
      console.log('📧 You can now test forgot password with this email');
    } else {
      console.log(`❌ User not found: ${testEmail}`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await db.end();
  }
}

testForgotPassword();