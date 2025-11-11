/**
 * Supabase Connection Test API Route
 * Visit http://localhost:3000/api/test-connection to verify setup
 *
 * This route tests:
 * - Environment variables
 * - Server client creation
 * - Database connectivity
 * - Authentication service
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const results: Record<string, any> = {
    timestamp: new Date().toISOString(),
    tests: {},
  };

  // Test 1: Environment Variables
  results.tests.environmentVariables = {
    status: 'pending',
  };

  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
  ];

  const missingVars = requiredVars.filter(
    (varName) => !process.env[varName]
  );

  if (missingVars.length > 0) {
    results.tests.environmentVariables = {
      status: 'failed',
      error: `Missing variables: ${missingVars.join(', ')}`,
    };
  } else {
    results.tests.environmentVariables = {
      status: 'passed',
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    };
  }

  // Test 2: Server Client Creation
  results.tests.serverClient = {
    status: 'pending',
  };

  try {
    const supabase = await createClient();
    results.tests.serverClient = {
      status: 'passed',
      message: 'Server client created successfully',
    };

    // Test 3: Database Connection
    results.tests.databaseConnection = {
      status: 'pending',
    };

    const { data: profilesCount, error: profilesError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    if (profilesError) {
      results.tests.databaseConnection = {
        status: 'failed',
        error: profilesError.message,
        hint: 'Have you run the database migrations in Supabase SQL Editor?',
      };
    } else {
      results.tests.databaseConnection = {
        status: 'passed',
        message: 'Database connection successful',
        profilesCount: profilesCount || 0,
      };
    }

    // Test 4: All Tables Exist
    results.tests.tablesExist = {
      status: 'pending',
    };

    const tables = ['profiles', 'messages', 'message_analytics', 'link_visits', 'blocked_senders'];
    const tableChecks: Record<string, boolean> = {};

    for (const table of tables) {
      const { error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })
        .limit(0);

      tableChecks[table] = !error;
    }

    const allTablesExist = Object.values(tableChecks).every((exists) => exists);

    if (allTablesExist) {
      results.tests.tablesExist = {
        status: 'passed',
        tables: tableChecks,
      };
    } else {
      results.tests.tablesExist = {
        status: 'failed',
        tables: tableChecks,
        hint: 'Run the SQL migration script in Supabase SQL Editor',
      };
    }

    // Test 5: Authentication Service
    results.tests.authService = {
      status: 'pending',
    };

    const { data: sessionData, error: authError } = await supabase.auth.getSession();

    if (authError) {
      results.tests.authService = {
        status: 'failed',
        error: authError.message,
      };
    } else {
      results.tests.authService = {
        status: 'passed',
        message: 'Auth service accessible',
        authenticated: !!sessionData.session,
      };
    }
  } catch (error: any) {
    results.tests.serverClient = {
      status: 'failed',
      error: error.message,
    };
  }

  // Summary
  const testResults = Object.values(results.tests);
  const passedCount = testResults.filter(
    (test: any) => test.status === 'passed'
  ).length;
  const totalCount = testResults.length;

  results.summary = {
    passed: passedCount,
    total: totalCount,
    allPassed: passedCount === totalCount,
    message:
      passedCount === totalCount
        ? '✅ All tests passed! Supabase is configured correctly.'
        : '❌ Some tests failed. Check the details above.',
  };

  // Return appropriate status code
  const statusCode = results.summary.allPassed ? 200 : 500;

  return NextResponse.json(results, {
    status: statusCode,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
