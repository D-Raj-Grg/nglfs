#!/usr/bin/env node

/**
 * Setup Storage Bucket for Avatar Uploads
 *
 * This script creates the 'avatars' storage bucket in Supabase
 * and sets up the necessary RLS policies.
 *
 * Run with: node scripts/setup-storage.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Missing environment variables');
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setupStorage() {
  console.log('🚀 Setting up Supabase Storage for avatars...\n');

  try {
    // Step 1: Create avatars bucket
    console.log('1️⃣  Creating avatars bucket...');

    // Check if bucket already exists
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(b => b.name === 'avatars');

    if (bucketExists) {
      console.log('   ✅ Avatars bucket already exists');
    } else {
      const { data, error } = await supabase.storage.createBucket('avatars', {
        public: true,
        fileSizeLimit: 2097152, // 2MB
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp']
      });

      if (error) {
        console.error('   ❌ Error creating bucket:', error.message);
        throw error;
      }
      console.log('   ✅ Avatars bucket created successfully');
    }

    // Step 2: Set up RLS policies
    console.log('\n2️⃣  Setting up RLS policies...');

    const policies = `
      -- Enable RLS on storage.objects
      ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

      -- Drop existing policies if they exist
      DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
      DROP POLICY IF EXISTS "Users can upload their own avatars" ON storage.objects;
      DROP POLICY IF EXISTS "Users can update their own avatars" ON storage.objects;
      DROP POLICY IF EXISTS "Users can delete their own avatars" ON storage.objects;

      -- Allow public read access to avatar files
      CREATE POLICY "Avatar images are publicly accessible"
      ON storage.objects FOR SELECT
      TO public
      USING (bucket_id = 'avatars');

      -- Allow authenticated users to upload their own avatars
      CREATE POLICY "Users can upload their own avatars"
      ON storage.objects FOR INSERT
      TO authenticated
      WITH CHECK (
        bucket_id = 'avatars' AND
        (storage.foldername(name))[1] = 'avatars' AND
        auth.uid()::text = (regexp_match(name, '^avatars/([a-f0-9-]+)-'))[1]
      );

      -- Allow authenticated users to update their own avatars
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

      -- Allow authenticated users to delete their own avatars
      CREATE POLICY "Users can delete their own avatars"
      ON storage.objects FOR DELETE
      TO authenticated
      USING (
        bucket_id = 'avatars' AND
        auth.uid()::text = (regexp_match(name, '^avatars/([a-f0-9-]+)-'))[1]
      );
    `;

    // Execute RLS policies
    const { error: policyError } = await supabase.rpc('exec_sql', { sql: policies });

    if (policyError) {
      // RLS policies need to be set up manually via SQL Editor
      console.log('   ⚠️  RLS policies need to be set up manually');
      console.log('   📝 Copy and run the SQL from: supabase/migrations/00002_storage_setup.sql');
      console.log('   🔗 Go to: Supabase Dashboard → SQL Editor');
    } else {
      console.log('   ✅ RLS policies configured successfully');
    }

    // Step 3: Verify setup
    console.log('\n3️⃣  Verifying setup...');

    const { data: finalBuckets } = await supabase.storage.listBuckets();
    const avatarBucket = finalBuckets?.find(b => b.name === 'avatars');

    if (avatarBucket) {
      console.log('   ✅ Avatars bucket verified');
      console.log(`      - Public: ${avatarBucket.public ? 'Yes' : 'No'}`);
      console.log(`      - Size Limit: ${avatarBucket.file_size_limit ? (avatarBucket.file_size_limit / 1024 / 1024) + 'MB' : 'None'}`);
    }

    console.log('\n✨ Storage setup complete!\n');
    console.log('📋 Next steps:');
    console.log('   1. If RLS policies weren\'t set automatically, run the SQL from:');
    console.log('      supabase/migrations/00002_storage_setup.sql');
    console.log('   2. Test avatar upload at: http://localhost:3000/onboarding');
    console.log('   3. Check uploads in: Supabase Dashboard → Storage → avatars\n');

  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    console.error('\n🔧 Manual setup required:');
    console.error('   Go to Supabase Dashboard → SQL Editor');
    console.error('   Run: supabase/migrations/00002_storage_setup.sql\n');
    process.exit(1);
  }
}

// Run setup
setupStorage();
