#!/usr/bin/env ts-node

/**
 * Rate Limiting Test Script
 *
 * Tests the brute force protection and rate limiting functionality
 * Run with: npm run test:rate-limiting
 */

import fetch from 'node-fetch';

const GRAPHQL_ENDPOINT = 'http://localhost:4000/graphql';

interface TestResult {
  success: boolean;
  message: string;
  details?: any;
}

class RateLimitingTester {
  private results: TestResult[] = [];

  private log(message: string, success: boolean = true, details?: any) {
    const result: TestResult = { success, message, details };
    this.results.push(result);

    const status = success ? '✅' : '❌';
    console.log(`${status} ${message}`);
    if (details) {
      console.log(`   Details:`, details);
    }
  }

  private async makeGraphQLRequest(query: string, variables?: any): Promise<{ status: number; data?: any; error?: string }> {
    try {
      const response = await fetch(GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables
        })
      });

      const status = response.status;

      if (status === 429) {
        return { status, error: 'Rate limit exceeded' };
      }

      if (!response.ok) {
        return { status, error: `HTTP ${status}` };
      }

      const data = await response.json();
      return { status, data };
    } catch (error) {
      return { status: 0, error: error instanceof Error ? error.message : 'Network error' };
    }
  }

  async testAPIRateLimiting() {
    console.log('\n🧪 Testing General API Rate Limiting...');

    const query = `
      query {
        __typename
      }
    `;

    // Make 120 requests (should exceed 100 limit)
    let successCount = 0;
    let rateLimitedCount = 0;

    console.log('Making 120 API requests (limit: 100/15min)...');

    for (let i = 1; i <= 120; i++) {
      const result = await this.makeGraphQLRequest(query);

      if (result.status === 200) {
        successCount++;
      } else if (result.status === 429) {
        rateLimitedCount++;
      }

      // Progress indicator
      if (i % 20 === 0) {
        process.stdout.write(` ${i}/120 `);
      }

      // Small delay to not overwhelm
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    console.log(); // New line after progress

    if (rateLimitedCount > 0) {
      this.log(`API rate limiting working: ${successCount} allowed, ${rateLimitedCount} blocked`, true, {
        allowed: successCount,
        blocked: rateLimitedCount
      });
    } else {
      this.log('API rate limiting may not be working - no requests were blocked', false);
    }
  }

  async testAuthRateLimiting() {
    console.log('\n🔐 Testing Authentication Rate Limiting...');

    const loginQuery = `
      mutation Login($input: LoginInput!) {
        login(input: $input) {
          token
        }
      }
    `;

    const variables = {
      input: {
        email: 'test@example.com',
        password: 'wrongpassword'
      }
    };

    // Make 8 login attempts (should exceed 5 limit)
    let successCount = 0;
    let rateLimitedCount = 0;
    let authErrorCount = 0;

    console.log('Making 8 failed login attempts (limit: 5/15min)...');

    for (let i = 1; i <= 8; i++) {
      const result = await this.makeGraphQLRequest(loginQuery, variables);

      if (result.status === 200) {
        if (result.data?.errors?.[0]?.message?.includes('Invalid')) {
          authErrorCount++;
        } else {
          successCount++;
        }
      } else if (result.status === 429) {
        rateLimitedCount++;
      }

      process.stdout.write(` ${i}/8 `);
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log();

    if (rateLimitedCount > 0) {
      this.log(`Auth rate limiting working: ${authErrorCount} auth errors, ${rateLimitedCount} rate limited`, true, {
        authErrors: authErrorCount,
        rateLimited: rateLimitedCount
      });
    } else {
      this.log('Auth rate limiting may not be working', false);
    }
  }

  async testSecurityHeaders() {
    console.log('\n🛡️ Testing Security Headers...');

    try {
      const response = await fetch(GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: '{ __typename }'
        })
      });

      const headers = response.headers;

      const securityHeaders = [
        { name: 'x-frame-options', required: true, value: 'DENY' },
        { name: 'x-content-type-options', required: true, value: 'nosniff' },
        { name: 'x-xss-protection', required: true },
        { name: 'content-security-policy', required: true },
        { name: 'referrer-policy', required: true },
        { name: 'strict-transport-security', required: false }, // Only in production
        { name: 'x-powered-by', required: false, shouldBeAbsent: true }
      ];

      let passedChecks = 0;

      for (const header of securityHeaders) {
        const headerValue = headers.get(header.name);

        if (header.shouldBeAbsent) {
          if (!headerValue) {
            passedChecks++;
            this.log(`Security header ${header.name}: correctly absent`, true);
          } else {
            this.log(`Security header ${header.name}: should be absent but found "${headerValue}"`, false);
          }
        } else if (header.required) {
          if (headerValue) {
            if (header.value && headerValue !== header.value) {
              this.log(`Security header ${header.name}: found "${headerValue}" but expected "${header.value}"`, false);
            } else {
              passedChecks++;
              this.log(`Security header ${header.name}: present (${headerValue})`, true);
            }
          } else {
            this.log(`Security header ${header.name}: missing (required)`, false);
          }
        }
      }

      this.log(`Security headers check: ${passedChecks}/${securityHeaders.filter(h => h.required).length} required headers present`, passedChecks >= 5);

    } catch (error) {
      this.log('Failed to test security headers', false, error);
    }
  }

  async testCSRFProtection() {
    console.log('\n🔒 Testing CSRF Protection...');

    const loginQuery = `
      mutation Login($input: LoginInput!) {
        login(input: $input) {
          token
        }
      }
    `;

    const variables = {
      input: {
        email: 'test@example.com',
        password: 'testpass'
      }
    };

    // Test 1: Request without Origin header
    const result1 = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: loginQuery, variables })
    });

    // Test 2: Request with malicious Origin
    const result2 = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://evil-attacker.com'
      },
      body: JSON.stringify({ query: loginQuery, variables })
    });

    // Test 3: Request with allowed Origin (localhost)
    const result3 = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:3000'
      },
      body: JSON.stringify({ query: loginQuery, variables })
    });

    // Analyze results
    const blockedByOrigin1 = result1.status === 403;
    const blockedByOrigin2 = result2.status === 403;
    const allowedOrigin3 = result3.status !== 403;

    if (blockedByOrigin1 || blockedByOrigin2) {
      this.log('CSRF origin validation working', true, {
        noOrigin: blockedByOrigin1 ? 'blocked' : 'allowed',
        maliciousOrigin: blockedByOrigin2 ? 'blocked' : 'allowed',
        allowedOrigin: allowedOrigin3 ? 'allowed' : 'blocked'
      });
    } else {
      this.log('CSRF protection may not be working properly', false);
    }
  }

  async runAllTests() {
    console.log('🚀 Starting Rate Limiting & Security Tests...\n');

    try {
      await this.testAPIRateLimiting();
      await this.testAuthRateLimiting();
      await this.testSecurityHeaders();
      await this.testCSRFProtection();

      console.log('\n📊 Test Results Summary:');
      console.log('='.repeat(50));

      const passed = this.results.filter(r => r.success).length;
      const total = this.results.length;

      this.results.forEach(result => {
        const status = result.success ? '✅' : '❌';
        console.log(`${status} ${result.message}`);
      });

      console.log('='.repeat(50));
      console.log(`🎯 Overall: ${passed}/${total} tests passed (${Math.round((passed/total)*100)}%)`);

      if (passed >= total * 0.8) {
        console.log('🎉 Security implementation is working well!');
      } else {
        console.log('⚠️  Some security features may need attention.');
      }

    } catch (error) {
      console.error('❌ Test suite failed:', error);
      process.exit(1);
    }
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  const tester = new RateLimitingTester();
  tester.runAllTests().catch(console.error);
}

export default RateLimitingTester;
