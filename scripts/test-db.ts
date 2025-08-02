import { neon } from '@neondatabase/serverless'
import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') })

async function testDatabaseConnection() {
  console.log('🔍 Testing Database Connection...\n')

  // Check if DATABASE_URL is set
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL is not set in environment variables')
    console.log('Please add DATABASE_URL to your .env.local file')
    return
  }

  console.log('✅ DATABASE_URL is configured')
  console.log(`📍 Database Host: ${process.env.DATABASE_URL.split('@')[1]?.split('/')[0] || 'Unknown'}\n`)

  try {
    const sql = neon(process.env.DATABASE_URL)
    
    // Test connection
    console.log('🔗 Testing connection...')
    const connectionTest = await sql`SELECT NOW() as current_time`
    console.log('✅ Connected successfully at:', connectionTest[0].current_time)
    
    // Check tables exist
    console.log('\n📊 Checking database tables...')
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `
    
    const expectedTables = ['users', 'products', 'checkouts', 'order_bumps', 'checkout_products', 'analytics_events', 'conversions']
    const foundTables = tables.map(t => t.table_name)
    
    console.log(`Found ${foundTables.length} tables:`)
    foundTables.forEach(table => {
      console.log(`  ✅ ${table}`)
    })
    
    // Check for missing tables
    const missingTables = expectedTables.filter(t => !foundTables.includes(t))
    if (missingTables.length > 0) {
      console.log('\n⚠️  Missing tables:')
      missingTables.forEach(table => {
        console.log(`  ❌ ${table}`)
      })
      console.log('\n💡 Run the migration SQL from /migrations/0000_fuzzy_winter_soldier.sql')
    }
    
    // Test creating a user (if tables exist)
    if (foundTables.includes('users')) {
      console.log('\n🧪 Testing user creation...')
      
      // Check if test user exists
      const testUserId = 'test_' + Date.now()
      const existingUsers = await sql`
        SELECT COUNT(*) as count FROM users WHERE id = ${testUserId}
      `
      
      if (existingUsers[0].count === '0') {
        // Create test user
        const newUser = await sql`
          INSERT INTO users (id, email, name, created_at, updated_at)
          VALUES (
            ${testUserId},
            ${'test@example.com'},
            ${'Test User'},
            NOW(),
            NOW()
          )
          RETURNING id, email
        `
        console.log('✅ Created test user:', newUser[0].email)
        
        // Clean up
        await sql`DELETE FROM users WHERE id = ${testUserId}`
        console.log('🧹 Cleaned up test user')
      }
    }
    
    // Count records in each table
    console.log('\n📈 Record counts:')
    for (const table of foundTables) {
      const count = await sql`SELECT COUNT(*) as count FROM ${sql(table)}`
      console.log(`  ${table}: ${count[0].count} records`)
    }
    
    console.log('\n✅ Database test completed successfully!')
    
  } catch (error) {
    console.error('\n❌ Database connection failed!')
    console.error('Error:', error)
    console.log('\n💡 Troubleshooting tips:')
    console.log('1. Verify DATABASE_URL is correct in .env.local')
    console.log('2. Check if your Neon database is active (not suspended)')
    console.log('3. Ensure the connection string includes ?sslmode=require')
    console.log('4. Run migrations if tables are missing')
  }
}

// Run the test
testDatabaseConnection()
  .then(() => process.exit(0))
  .catch(() => process.exit(1))