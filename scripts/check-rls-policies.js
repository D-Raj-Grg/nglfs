#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkPolicies() {
  console.log('🔍 Checking RLS policies for storage.objects...\n');

  try {
    // Query to check RLS policies on storage.objects
    const { data, error } = await supabase
      .from('pg_policies')
      .select('*')
      .eq('schemaname', 'storage')
      .eq('tablename', 'objects');

    if (error) {
      // Try alternative query
      const { data: policies, error: error2 } = await supabase.rpc('exec', {
        query: `
          SELECT
            schemaname,
            tablename,
            policyname,
            permissive,
            roles,
            cmd,
            qual,
            with_check
          FROM pg_policies
          WHERE schemaname = 'storage'
          AND tablename = 'objects'
          ORDER BY policyname;
        `
      });

      if (error2) {
        console.log('⚠️  Cannot query policies directly via API\n');
        console.log('📝 Manual check required:');
        console.log('   Go to: Supabase Dashboard → SQL Editor');
        console.log('   Run this query:\n');
        console.log('   SELECT policyname FROM pg_policies');
        console.log('   WHERE schemaname = \'storage\' AND tablename = \'objects\';\n');
        return;
      }

      console.log('Policies found:', policies);
      return;
    }

    if (!data || data.length === 0) {
      console.log('❌ No RLS policies found for storage.objects!\n');
      console.log('This explains why avatar uploads are failing.\n');
      console.log('📝 To fix:');
      console.log('   1. Open Supabase Dashboard: https://supabase.com/dashboard/project/ydhnhbcbiqmblfdmmywu/sql');
      console.log('   2. Run: supabase/migrations/00002_storage_setup.sql\n');
    } else {
      console.log('✅ Found', data.length, 'RLS policies:\n');
      data.forEach(policy => {
        console.log(`   - ${policy.policyname}`);
        console.log(`     Command: ${policy.cmd}`);
        console.log(`     Roles: ${policy.roles}`);
        console.log('');
      });
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkPolicies();
