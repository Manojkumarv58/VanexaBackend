import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('render.com') 
    ? { rejectUnauthorized: false } 
    : false,
});

async function testCategoryFilter() {
  console.log('🧪 Testing category filter...\n');
  
  // Test 1: Men category
  console.log('Test 1: Filtering by "Men" category');
  const menResult = await db.query(`
    SELECT name, category 
    FROM products 
    WHERE category ILIKE $1
    LIMIT 5
  `, ['%Men%']);
  
  console.log(`  Found ${menResult.rows.length} products:`);
  menResult.rows.forEach(p => console.log(`    - ${p.name} (${p.category})`));
  
  // Test 2: Women category
  console.log('\nTest 2: Filtering by "Women" category');
  const womenResult = await db.query(`
    SELECT name, category 
    FROM products 
    WHERE category ILIKE $1
    LIMIT 5
  `, ['%Women%']);
  
  console.log(`  Found ${womenResult.rows.length} products:`);
  womenResult.rows.forEach(p => console.log(`    - ${p.name} (${p.category})`));
  
  // Test 3: Exact match
  console.log('\nTest 3: Exact match for "Men"');
  const exactResult = await db.query(`
    SELECT name, category 
    FROM products 
    WHERE category = $1
    LIMIT 5
  `, ['Men']);
  
  console.log(`  Found ${exactResult.rows.length} products:`);
  exactResult.rows.forEach(p => console.log(`    - ${p.name} (${p.category})`));
  
  await db.end();
}

testCategoryFilter().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
