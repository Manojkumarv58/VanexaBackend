import pkg from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const { Pool } = pkg;

// Use Render database connection
const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('render.com') 
    ? { rejectUnauthorized: false } 
    : false,
});

// ── High-quality e-commerce images per category ──────────────────────────────
const IMAGES = {
  'Men': [
    'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=500&q=80',
    'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=500&q=80',
    'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500&q=80',
    'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=500&q=80',
    'https://images.unsplash.com/photo-1621072156002-e2fccdc0b176?w=500&q=80',
    'https://images.unsplash.com/photo-1622445275463-afa2ab738c34?w=500&q=80',
  ],
  'Women': [
    'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&q=80',
    'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=500&q=80',
    'https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=500&q=80',
    'https://images.unsplash.com/photo-1612423284934-2850a4ea6b0f?w=500&q=80',
    'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=500&q=80',
    'https://images.unsplash.com/photo-1596783074918-c84cb06531ca?w=500&q=80',
  ],
  'Electronics': [
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80',
    'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500&q=80',
    'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&q=80',
    'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=500&q=80',
    'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=500&q=80',
    'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=500&q=80',
  ],
  'Accessories': [
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&q=80',
    'https://images.unsplash.com/photo-1591561954557-26941169b49e?w=500&q=80',
    'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=500&q=80',
    'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=500&q=80',
    'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=500&q=80',
    'https://images.unsplash.com/photo-1624687943971-e86af76d57de?w=500&q=80',
  ],
  'Sports': [
    'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=500&q=80',
    'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=500&q=80',
    'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=500&q=80',
    'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500&q=80',
    'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500&q=80',
    'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=500&q=80',
  ],
  'Beauty': [
    'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&q=80',
    'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=500&q=80',
    'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500&q=80',
    'https://images.unsplash.com/photo-1631214524020-7e18db9a8f92?w=500&q=80',
    'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&q=80',
    'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=500&q=80',
  ],
};

// ── Realistic product templates per category ─────────────────────────────────
const PRODUCTS = {
  'Men': [
    { name: 'Classic Fit Oxford Shirt', desc: 'Premium cotton Oxford shirt with button-down collar. Perfect for office and casual wear. Available in multiple colors.' },
    { name: 'Slim Fit Chinos', desc: 'Modern slim-fit chinos in stretch cotton blend. Comfortable all-day wear with a clean, polished look.' },
    { name: 'Leather Derby Shoes', desc: 'Handcrafted genuine leather derby shoes with cushioned insole. Classic design for formal occasions.' },
    { name: 'Wool Blend Blazer', desc: 'Sophisticated wool blend blazer with notch lapels. Versatile piece that elevates any outfit.' },
    { name: 'Crew Neck T-Shirt', desc: 'Soft 100% cotton crew neck tee. Relaxed fit for everyday casual wear. Pack of 3.' },
    { name: 'Denim Jacket', desc: 'Classic denim jacket with chest pockets and button closure. A timeless wardrobe staple.' },
    { name: 'Formal Dress Trousers', desc: 'Tailored formal trousers in premium fabric. Straight cut with comfortable waistband.' },
    { name: 'Polo Shirt', desc: 'Classic polo shirt in pique cotton. Ribbed collar and cuffs with two-button placket.' },
    { name: 'Cargo Shorts', desc: 'Durable cargo shorts with multiple pockets. Perfect for outdoor activities and summer.' },
    { name: 'Linen Kurta', desc: 'Breathable linen kurta with intricate embroidery. Ideal for festive occasions.' },
    { name: 'Bomber Jacket', desc: 'Stylish bomber jacket with ribbed cuffs and hem. Lightweight for transitional weather.' },
    { name: 'Jogger Pants', desc: 'Comfortable jogger pants with elastic waistband and tapered fit. Great for workouts.' },
    { name: 'Henley T-Shirt', desc: 'Casual henley tee with button placket. Soft jersey fabric for all-day comfort.' },
    { name: 'Leather Belt', desc: 'Genuine leather belt with classic buckle. Durable accessory for formal and casual outfits.' },
    { name: 'Knit Sweater', desc: 'Cozy knit sweater in merino wool blend. Crew neck design perfect for layering.' },
  ],
  'Women': [
    { name: 'Floral Wrap Dress', desc: 'Beautiful floral wrap dress in lightweight chiffon. Flattering silhouette with adjustable tie waist.' },
    { name: 'High-Waist Skinny Jeans', desc: 'Classic high-waist jeans in stretch denim. Slim fit with comfortable waistband.' },
    { name: 'Silk Blouse', desc: 'Luxurious silk blouse with relaxed fit. Versatile piece that transitions from office to evening.' },
    { name: 'Maxi Skirt', desc: 'Flowing maxi skirt in printed fabric. Elastic waistband for comfort with bohemian aesthetic.' },
    { name: 'Crop Top', desc: 'Trendy crop top in soft jersey fabric. Pairs perfectly with high-waist bottoms.' },
    { name: 'Blazer Dress', desc: 'Chic blazer dress with structured shoulders. Power dressing made effortless.' },
    { name: 'Embroidered Kurti', desc: 'Elegant kurti with hand embroidery on soft cotton. Perfect for festive occasions.' },
    { name: 'Palazzo Pants', desc: 'Wide-leg palazzo pants in flowy fabric. Comfortable for casual and semi-formal occasions.' },
    { name: 'Denim Skirt', desc: 'Classic denim skirt with button-front detail. A versatile wardrobe staple.' },
    { name: 'Lace Trim Camisole', desc: 'Delicate camisole with lace trim detailing. Soft fabric perfect for layering.' },
    { name: 'Trench Coat', desc: 'Timeless trench coat in water-resistant fabric. Double-breasted design with belted waist.' },
    { name: 'Bodycon Dress', desc: 'Figure-hugging bodycon dress in stretch fabric. Perfect for evenings out.' },
    { name: 'Printed Saree', desc: 'Vibrant printed saree in georgette fabric. Comes with matching blouse piece.' },
    { name: 'Cardigan', desc: 'Soft knit cardigan with button closure. Cozy layering piece for cooler days.' },
    { name: 'Jumpsuit', desc: 'Stylish one-piece jumpsuit with wide legs. Effortless outfit for any occasion.' },
  ],
  'Electronics': [
    { name: 'Wireless Earbuds Pro', desc: 'True wireless earbuds with active noise cancellation. 30-hour battery life with premium sound quality.' },
    { name: 'Smart Watch Series 7', desc: 'Advanced smartwatch with health monitoring, GPS, and 7-day battery. AMOLED display.' },
    { name: 'Bluetooth Speaker', desc: 'Portable Bluetooth speaker with 360-degree sound. 20-hour battery, IPX7 waterproof.' },
    { name: 'USB-C Hub 7-in-1', desc: 'Versatile USB-C hub with HDMI, USB 3.0, SD card reader, and 100W PD charging.' },
    { name: 'Mechanical Keyboard RGB', desc: 'Compact mechanical keyboard with RGB backlight and tactile switches. Perfect for gaming.' },
    { name: 'Wireless Gaming Mouse', desc: 'Ergonomic wireless mouse with 16000 DPI and programmable buttons. 3-month battery life.' },
    { name: 'Power Bank 20000mAh', desc: 'High-capacity power bank with 65W fast charging. Dual USB-C ports for simultaneous charging.' },
    { name: 'LED Desk Lamp', desc: 'Smart LED desk lamp with adjustable color temperature. USB charging port built-in.' },
    { name: 'Webcam 4K Ultra HD', desc: 'Ultra HD 4K webcam with built-in microphone and auto-focus. Perfect for video calls.' },
    { name: 'Noise Cancelling Headphones', desc: 'Over-ear headphones with industry-leading noise cancellation. 40-hour battery life.' },
    { name: 'Smart Home Hub', desc: 'Central smart home controller compatible with all major platforms. Voice control enabled.' },
    { name: 'Portable SSD 1TB', desc: 'Ultra-fast portable SSD with USB 3.2 speeds up to 1050MB/s. Shock-resistant design.' },
    { name: 'Gaming Controller Pro', desc: 'Wireless gaming controller with haptic feedback and adaptive triggers. Multi-platform support.' },
    { name: 'Smart Plug WiFi', desc: 'Wi-Fi smart plug with energy monitoring and voice control. Schedule and automate devices.' },
    { name: 'Ring Light 18 inch', desc: 'Professional ring light with adjustable color temperature. Perfect for photography and streaming.' },
  ],
  'Accessories': [
    { name: 'Leather Wallet RFID', desc: 'Slim genuine leather wallet with RFID blocking. Multiple card slots and bill compartment.' },
    { name: 'Aviator Sunglasses', desc: 'Classic aviator sunglasses with UV400 protection. Lightweight metal frame with polarized lenses.' },
    { name: 'Canvas Backpack', desc: 'Durable canvas backpack with laptop compartment. Multiple pockets for organization.' },
    { name: 'Silk Scarf', desc: 'Luxurious silk scarf with vibrant print. Versatile accessory for styling outfits.' },
    { name: 'Leather Handbag', desc: 'Structured leather handbag with gold-tone hardware. Spacious interior with compartments.' },
    { name: 'Baseball Cap', desc: 'Classic baseball cap in cotton twill. Adjustable strap for perfect fit.' },
    { name: 'Stainless Steel Watch', desc: 'Elegant stainless steel watch with sapphire crystal. Water-resistant with classic dial.' },
    { name: 'Beaded Bracelet Set', desc: 'Set of 5 handcrafted beaded bracelets. Perfect for stacking and layering.' },
    { name: 'Crossbody Bag', desc: 'Compact leather crossbody bag with adjustable strap. Ideal for everyday essentials.' },
    { name: 'Woolen Beanie', desc: 'Soft woolen beanie with ribbed texture. Keeps you warm in style during winter.' },
    { name: 'Pearl Necklace', desc: 'Elegant freshwater pearl necklace with sterling silver clasp. Timeless jewelry piece.' },
    { name: 'Tote Bag Canvas', desc: 'Spacious canvas tote bag with leather handles. Eco-friendly and perfect for shopping.' },
    { name: 'Silk Tie Set', desc: 'Premium silk tie set with matching pocket square. Classic patterns for formal occasions.' },
    { name: 'Ankle Boots Leather', desc: 'Stylish ankle boots in genuine leather. Block heel with side zipper for easy wear.' },
    { name: 'Clutch Purse Evening', desc: 'Elegant clutch purse with embellished detail. Perfect for evening events.' },
  ],
  'Sports': [
    { name: 'Running Shoes Pro', desc: 'Lightweight running shoes with responsive cushioning. Breathable mesh upper for road running.' },
    { name: 'Yoga Mat Premium', desc: 'Non-slip yoga mat with alignment lines. 6mm thickness for joint support with carrying strap.' },
    { name: 'Resistance Bands Set', desc: 'Set of 5 resistance bands with varying tension levels. Perfect for strength training.' },
    { name: 'Gym Gloves Pro', desc: 'Padded gym gloves with wrist support. Improve grip and protect hands during weightlifting.' },
    { name: 'Insulated Water Bottle', desc: 'Stainless steel water bottle keeps drinks cold for 24 hours. 1L capacity with leak-proof lid.' },
    { name: 'Speed Jump Rope', desc: 'Professional jump rope with ball bearings. Adjustable length for all heights.' },
    { name: 'Foam Roller', desc: 'High-density foam roller for muscle recovery. Textured surface for deep tissue massage.' },
    { name: 'Dumbbell Set 10kg', desc: 'Pair of 10kg rubber-coated dumbbells. Ergonomic grip for home gym workouts.' },
    { name: 'Cycling Helmet', desc: 'Lightweight cycling helmet with ventilation channels. Adjustable fit system, CE certified.' },
    { name: 'Swimming Goggles', desc: 'Anti-fog swimming goggles with UV protection. Adjustable nose bridge for comfortable seal.' },
    { name: 'Sports Gym Bag', desc: 'Spacious sports bag with shoe compartment. Water-resistant with wet pocket.' },
    { name: 'Badminton Racket', desc: 'Lightweight carbon fiber badminton racket. Excellent control and power for all levels.' },
    { name: 'Cricket Bat English Willow', desc: 'English willow cricket bat with full-size blade. Excellent pickup and balance.' },
    { name: 'Football FIFA Approved', desc: 'FIFA-approved football with durable outer casing. Consistent flight and excellent touch.' },
    { name: 'Protein Shaker Bottle', desc: 'BPA-free protein shaker with mixing ball. Leak-proof lid with measurement markings.' },
  ],
  'Beauty': [
    { name: 'Vitamin C Serum 20%', desc: 'Brightening vitamin C serum with 20% concentration. Reduces dark spots and boosts collagen.' },
    { name: 'Hydrating Face Cream', desc: 'Rich moisturizing cream with hyaluronic acid. Provides 24-hour hydration for all skin types.' },
    { name: 'Matte Lipstick Set', desc: 'Set of 6 long-lasting matte lipsticks. Comfortable formula in versatile shades.' },
    { name: 'Eyeshadow Palette 18 Shades', desc: '18-shade eyeshadow palette with matte and shimmer finishes. Highly pigmented formula.' },
    { name: 'Micellar Water', desc: 'Gentle micellar water that removes makeup without rinsing. Suitable for sensitive skin.' },
    { name: 'Hair Serum Argan Oil', desc: 'Nourishing hair serum with argan oil and keratin. Controls frizz and adds shine.' },
    { name: 'Sunscreen SPF 50 PA+++', desc: 'Lightweight sunscreen with SPF 50+ PA+++ protection. Non-greasy formula for daily use.' },
    { name: 'Face Wash Salicylic Acid', desc: 'Gentle foaming face wash with salicylic acid. Removes impurities and controls oil.' },
    { name: 'Volumizing Mascara', desc: 'Volumizing mascara with curved brush. Smudge-proof and long-lasting formula.' },
    { name: 'Rose Water Toner', desc: 'Natural rose water toner that balances skin pH. Alcohol-free with instant hydration.' },
    { name: 'Nail Polish Set 10 Colors', desc: 'Set of 10 nail polishes in trending shades. Quick-dry formula with chip-resistant finish.' },
    { name: 'Sheet Mask Pack 10pcs', desc: 'Pack of 10 hydrating sheet masks. Different formulas for various skin concerns.' },
    { name: 'Floral Perfume 50ml', desc: 'Elegant floral perfume with notes of rose and jasmine. Long-lasting fragrance.' },
    { name: 'BB Cream SPF 30', desc: 'Multi-tasking BB cream with SPF 30. Provides coverage, hydration, and sun protection.' },
    { name: 'Anti-Dandruff Shampoo', desc: 'Anti-dandruff shampoo with zinc pyrithione. Removes flakes and soothes itchy scalp.' },
  ],
};

// ── Price ranges per category (max 999.99 due to DECIMAL(5,2)) ───────────────
const PRICE_RANGES = {
  'Men':         { min: 299, max: 999 },
  'Women':       { min: 299, max: 999 },
  'Electronics': { min: 399, max: 999 },
  'Accessories': { min: 199, max: 899 },
  'Sports':      { min: 199, max: 999 },
  'Beauty':      { min: 99, max: 799 },
};

function randFloat(min, max) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(2));
}
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function randRating() {
  return parseFloat((Math.random() * 2 + 3).toFixed(2)); // 3.00 – 5.00
}
function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function seed() {
  console.log('🚀 Starting seed process...\n');
  console.log('🗑️  Deleting old products...');

  // Delete all existing products
  await db.query('DELETE FROM products');
  console.log('✅ Old products deleted\n');

  // Get or create admin user
  let adminId;
  const adminRes = await db.query(`SELECT id FROM users WHERE role = 'Admin' LIMIT 1`);
  if (adminRes.rows.length === 0) {
    console.log('⚠️  No admin user found. Creating a seed admin...');
    const bcrypt = await import('bcrypt');
    const hashed = await bcrypt.default.hash('Admin@123', 10);
    const newAdmin = await db.query(
      `INSERT INTO users (name, email, password, role) VALUES ($1,$2,$3,$4) RETURNING id`,
      ['Seed Admin', 'admin@vanexa.com', hashed, 'Admin']
    );
    adminId = newAdmin.rows[0].id;
    console.log(`✅ Created seed admin: admin@vanexa.com / Admin@123\n`);
  } else {
    adminId = adminRes.rows[0].id;
    console.log(`✅ Using existing admin: ${adminId}\n`);
  }

  const categories = Object.keys(PRODUCTS);
  let totalInserted = 0;

  for (const category of categories) {
    const templates = PRODUCTS[category];
    const images    = IMAGES[category];
    const range     = PRICE_RANGES[category];
    const count     = 100; // 100 products per category = 600 total

    console.log(`📦 Seeding ${count} products for category: ${category}`);

    for (let i = 0; i < count; i++) {
      const template = templates[i % templates.length];
      const suffix   = Math.floor(i / templates.length) > 0
        ? ` ${['Pro', 'Plus', 'Elite', 'Premium', 'Lite', 'Max', 'Ultra', 'Deluxe', 'Special Edition'][Math.floor(i / templates.length) % 9]}`
        : '';
      const name     = `${template.name}${suffix}`;
      const desc     = template.desc;
      const price    = randFloat(range.min, range.max);
      const stock    = randInt(15, 250);
      const ratings  = randRating();
      const imgUrl   = pickRandom(images);
      const imgJson  = JSON.stringify([{ url: imgUrl, public_id: `vanexa_${category.toLowerCase()}_${i}` }]);

      await db.query(
        `INSERT INTO products (name, description, price, category, stock, created_by, images, ratings)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [name, desc, price, category, stock, adminId, imgJson, ratings]
      );
    }

    totalInserted += count;
    console.log(`  ✅ Inserted ${count} products for ${category}\n`);
  }

  console.log(`\n🎉 Seeding complete! Total products inserted: ${totalInserted}`);
  console.log(`📊 Categories: ${categories.length}`);
  console.log(`📦 Products per category: 100`);
  console.log(`\n🔑 Admin Login: admin@vanexa.com / Admin@123`);
  
  await db.end();
}

seed().catch(err => {
  console.error('❌ Seeding failed:', err.message);
  console.error(err);
  process.exit(1);
});
