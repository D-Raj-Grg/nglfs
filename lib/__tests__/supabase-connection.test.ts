/**
 * Supabase Connection Test
 * Run this test to verify Supabase setup is working correctly
 *
 * Usage:
 * 1. Ensure database schema is deployed (run migrations in Supabase SQL Editor)
 * 2. Run: npm run test (after setting up jest/vitest)
 * 3. Or manually test by creating a test API route
 */

import { createClient as createBrowserClient } from '@/lib/supabase/client';

/**
 * Test 1: Browser Client Creation
 * Verifies environment variables are loaded correctly
 */
export function testBrowserClient() {
  try {
    const supabase = createBrowserClient();
    console.log('✅ Browser client created successfully');
    return true;
  } catch (error) {
    console.error('❌ Browser client creation failed:', error);
    return false;
  }
}

/**
 * Test 2: Server Client Creation
 * Verifies server client can be created (requires Next.js runtime)
 */
export async function testServerClient() {
  try {
    // Note: This import only works in Next.js server context
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();
    console.log('✅ Server client created successfully');
    return true;
  } catch (error) {
    console.error('❌ Server client creation failed:', error);
    return false;
  }
}

/**
 * Test 3: Database Connection
 * Attempts to query the profiles table
 */
export async function testDatabaseConnection() {
  try {
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);

    if (error) {
      console.error('❌ Database connection failed:', error);
      return false;
    }

    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

/**
 * Test 4: Authentication Service
 * Verifies auth service is accessible
 */
export async function testAuthService() {
  try {
    const supabase = createBrowserClient();
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      console.error('❌ Auth service failed:', error);
      return false;
    }

    console.log('✅ Auth service accessible');
    console.log('Current session:', data.session ? 'Authenticated' : 'Not authenticated');
    return true;
  } catch (error) {
    console.error('❌ Auth service failed:', error);
    return false;
  }
}

/**
 * Test 5: Storage Service
 * Verifies storage service is accessible
 */
export async function testStorageService() {
  try {
    const supabase = createBrowserClient();

    // Try to list buckets (will fail if not authenticated, but tests connectivity)
    const { data, error } = await supabase.storage.listBuckets();

    // Error expected if not authenticated, but connection should work
    if (error && error.message.includes('JWT')) {
      console.log('✅ Storage service accessible (authentication required for listing)');
      return true;
    }

    if (error) {
      console.error('❌ Storage service failed:', error);
      return false;
    }

    console.log('✅ Storage service accessible');
    console.log('Available buckets:', data?.length || 0);
    return true;
  } catch (error) {
    console.error('❌ Storage service failed:', error);
    return false;
  }
}

/**
 * Test 6: Environment Variables
 * Verifies all required environment variables are set
 */
export function testEnvironmentVariables() {
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ];

  const missingVars = requiredVars.filter(
    (varName) => !process.env[varName]
  );

  if (missingVars.length > 0) {
    console.error('❌ Missing environment variables:', missingVars);
    return false;
  }

  console.log('✅ All required environment variables are set');

  // Check URL format
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url?.startsWith('https://')) {
    console.error('❌ Invalid Supabase URL format');
    return false;
  }

  console.log('Supabase URL:', url);
  return true;
}

/**
 * Run all tests
 */
export async function runAllTests() {
  console.log('\n🧪 Starting Supabase Connection Tests...\n');

  const results = {
    environmentVariables: testEnvironmentVariables(),
    browserClient: testBrowserClient(),
    authService: await testAuthService(),
    storageService: await testStorageService(),
    databaseConnection: await testDatabaseConnection(),
  };

  console.log('\n📊 Test Results:\n');
  console.table(results);

  const allPassed = Object.values(results).every((result) => result === true);

  if (allPassed) {
    console.log('\n✅ All tests passed! Supabase is configured correctly.\n');
  } else {
    console.log('\n❌ Some tests failed. Please check the errors above.\n');
  }

  return allPassed;
}
