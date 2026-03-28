import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load .env.local from apps/web
dotenv.config({ path: path.resolve(__dirname, '../apps/web/.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

async function testConnection() {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase environment variables')
    console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl)
    console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'EXISTS' : 'MISSING')
    process.exit(1)
  }

  console.log(`Connecting to Supabase at ${supabaseUrl}...`)
  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  // Try to select from a common table or just a simple query
  const { data, error } = await supabase.from('profiles').select('*').limit(1)

  if (error) {
    console.error('❌ Supabase connection failed:', error.message)
    console.error('Full error:', JSON.stringify(error, null, 2))
  } else {
    console.log('✅ Supabase connection successful!')
    console.log('Data sample:', data)
  }
}

testConnection()
