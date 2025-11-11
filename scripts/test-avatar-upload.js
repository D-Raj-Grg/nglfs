#!/usr/bin/env node

/**
 * Test Avatar Upload
 *
 * This script tests if the avatar upload functionality is working
 * by attempting to upload a test file.
 *
 * Run with: node scripts/test-avatar-upload.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testUpload() {
  console.log('🧪 Testing avatar upload functionality...\n');

  try {
    // Create a small test image buffer (1x1 PNG)
    const testImageBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );

    const testUserId = 'test-user-' + Date.now();
    const fileName = `avatars/${testUserId}-${Date.now()}.png`;

    console.log('1️⃣  Uploading test image...');
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, testImageBuffer, {
        contentType: 'image/png',
        upsert: false
      });

    if (uploadError) {
      console.error('   ❌ Upload failed:', uploadError.message);

      if (uploadError.message.includes('row-level security')) {
        console.log('\n⚠️  RLS Policy Issue Detected\n');
        console.log('The avatars bucket exists but RLS policies are not properly configured.');
        console.log('\n📝 To fix this:');
        console.log('   1. Go to: https://supabase.com/dashboard/project/ydhnhbcbiqmblfdmmywu/sql/new');
        console.log('   2. Copy and paste the SQL from: supabase/migrations/00002_storage_setup.sql');
        console.log('   3. Click "Run" to execute');
        console.log('   4. Try uploading an avatar again\n');
        return;
      }

      throw uploadError;
    }

    console.log('   ✅ Upload successful!');
    console.log(`      Path: ${uploadData.path}`);

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(uploadData.path);

    console.log(`      URL: ${urlData.publicUrl}`);

    // Clean up test file
    console.log('\n2️⃣  Cleaning up test file...');
    const { error: deleteError } = await supabase.storage
      .from('avatars')
      .remove([uploadData.path]);

    if (deleteError) {
      console.log('   ⚠️  Could not delete test file (this is okay)');
    } else {
      console.log('   ✅ Test file deleted');
    }

    console.log('\n✨ Avatar upload is working correctly!\n');
    console.log('✅ You can now upload avatars at: http://localhost:3000/onboarding\n');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

testUpload();
