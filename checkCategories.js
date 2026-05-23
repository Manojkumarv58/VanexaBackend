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

async function checkCategories() {
  console.log('📊 Checking categories in database...\n');
  
  const result = await db.query(`
    SELECT category, COUNT(*) as count 
    FROM products 
    GROUP BY category 
    ORDER BY category
  `);
  
  console.log('Categories found:');
  result.rows.forEach(row => {
    console.log(`  ✅ ${row.category}: ${row.count} products`);
  });
  
  console.log('\n📦 Sample products from each category:');
  for (const row of result.rows) {
    const sample = await db.query(`
      SELECT name, category 
      FROM products 
      WHERE category = $1 
      LIMIT 3
    `, [row.category]);
    
    console.log(`\n  ${row.category}:`);
    sample.rows.forEach(p => console.log(`    - ${p.name}`));
  }
  
  await db.end();
}

checkCategories().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
