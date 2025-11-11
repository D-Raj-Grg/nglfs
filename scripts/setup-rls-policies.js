#!/usr/bin/env node

/**
 * Setup RLS Policies for Avatar Storage
 *
 * This script creates the necessary RLS policies for avatar uploads
 * using the Supabase management API.
 *
 * Run with: node scripts/setup-rls-policies.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// SQL to create policies (without ALTER TABLE - that's the issue)
const POLICIES_SQL = `
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatars" ON storage.objects;

-- 1. Allow public read access to avatar files
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- 2. Allow authenticated users to upload their own avatars
CREATE POLICY "Users can upload their own avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = 'avatars' AND
  auth.uid()::text = (regexp_match(name, '^avatars/([a-f0-9-]+)-'))[1]
);

-- 3. Allow authenticated users to update their own avatars
CREATE POLICY "Users can update their own avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (regexp_match(name, '^avatars/([a-f0-9-]+)-'))[1]
)
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.uid()::text = (regexp_match(name, '^avatars/([a-f0-9-]+)-'))[1]
);

-- 4. Allow authenticated users to delete their own avatars
CREATE POLICY "Users can delete their own avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (regexp_match(name, '^avatars/([a-f0-9-]+)-'))[1]
);
`;

async function setupPolicies() {
  console.log('🔐 Setting up RLS policies for avatar storage...\n');

  try {
    // Split SQL into individual statements
    const statements = POLICIES_SQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`Found ${statements.length} SQL statements to execute\n`);

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      const isDropPolicy = statement.includes('DROP POLICY');
      const isPolicyName = statement.match(/POLICY "([^"]+)"/);
      const policyName = isPolicyName ? isPolicyName[1] : '';

      if (isDropPolicy) {
        console.log(`${i + 1}. Dropping policy: ${policyName}...`);
      } else if (policyName) {
        console.log(`${i + 1}. Creating policy: ${policyName}...`);
      } else {
        console.log(`${i + 1}. Executing statement...`);
      }

      try {
        const { error } = await supabase.rpc('exec', {
          sql: statement + ';'
        });

        if (error && !error.message?.includes('does not exist')) {
          // Ignore "policy does not exist" errors on DROP
          throw error;
        }

        console.log('   ✅ Success\n');
        successCount++;
      } catch (error) {
        console.log('   ❌ Failed:', error.message);
        failCount++;
      }
    }

    console.log('\n📊 Summary:');
    console.log(`   ✅ Successful: ${successCount}`);
    console.log(`   ❌ Failed: ${failCount}\n`);

    if (failCount > 0) {
      console.log('⚠️  Some operations failed. Manual setup required.\n');
      console.log('📝 Please run the SQL manually:');
      console.log('   1. Go to: https://supabase.com/dashboard/project/ydhnhbcbiqmblfdmmywu/sql');
      console.log('   2. Copy SQL from: supabase/migrations/00002_storage_setup_fixed.sql');
      console.log('   3. Click "Run"\n');
      return false;
    }

    console.log('✨ RLS policies setup complete!\n');
    console.log('✅ You can now upload avatars at: http://localhost:3000/onboarding\n');
    return true;

  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    console.error('\n🔧 Manual setup required:');
    console.error('   Go to: https://supabase.com/dashboard/project/ydhnhbcbiqmblfdmmywu/sql');
    console.error('   Run: supabase/migrations/00002_storage_setup_fixed.sql\n');
    return false;
  }
}

// Run setup
setupPolicies().then(success => {
  process.exit(success ? 0 : 1);
});
