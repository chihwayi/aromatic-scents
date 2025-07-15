const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')

// Read environment variables from .env.local
const envContent = fs.readFileSync('.env.local', 'utf8')
const envVars = {}
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=')
  if (key && value) {
    envVars[key.trim()] = value.trim()
  }
})

const supabase = createClient(
  envVars.NEXT_PUBLIC_SUPABASE_URL,
  envVars.SUPABASE_SERVICE_ROLE_KEY
)

async function updateDatabase() {
  try {
    console.log('Adding is_new_arrival column to products table...')
    
    // Add the column
    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE products ADD COLUMN IF NOT EXISTS is_new_arrival BOOLEAN DEFAULT false;'
    })
    
    if (alterError) {
      console.log('Column might already exist, continuing...')
    }
    
    // Update some products to be new arrivals
    console.log('Marking some products as new arrivals...')
    const { data, error } = await supabase
      .from('products')
      .update({ is_new_arrival: true })
      .in('name', ['Midnight Elegance', 'Ocean Breeze'])
      .select()
    
    if (error) {
      console.error('Error updating products:', error)
    } else {
      console.log('Successfully updated products:', data)
    }
    
    console.log('Database update completed!')
  } catch (error) {
    console.error('Database update failed:', error)
  }
}

updateDatabase()