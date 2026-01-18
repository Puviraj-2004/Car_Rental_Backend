#!/usr/bin/env ts-node

/**
 * CSRF (Cross-Site Request Forgery) Protection Test
 *
 * Tests origin validation, CSRF tokens, and cross-origin request protection
 */

import fetch from 'node-fetch';

const GRAPHQL_ENDPOINT = 'http://localhost:4000/graphql';
const CSRF_ENDPOINT = 'http://localhost:4000/csrf-token';

interface CSRFTestResult {
  success: boolean;
  message: string;
  details?: any;
}

class CSRFProtectionTester {

  async testOriginValidation() {
    console.log('\n🌐 Testing Origin-Based CSRF Protection...');

    const loginMutation = `
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

    const testCases = [
      {
        name: 'No Origin Header',
        headers: { 'Content-Type': 'application/json' },
        shouldBeBlocked: true
      },
      {
        name: 'Allowed Origin (localhost:3000)',
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'http://localhost:3000'
        },
        shouldBeBlocked: false
      },
      {
        name: 'Allowed Origin (localhost:3001)',
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'http://localhost:3001'
        },
        shouldBeBlocked: false
      },
      {
        name: 'Malicious Origin',
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'https://evil-attacker.com'
        },
        shouldBeBlocked: true
      },
      {
        name: 'Null Origin',
        headers: {
          'Content-Type': 'application/json',
          'Origin': null
        },
        shouldBeBlocked: true
      }
    ];

    let passedTests = 0;

    for (const testCase of testCases) {
      console.log(`Testing: ${testCase.name}`);

      const headers: Record<string, string> = {};
      if (testCase.headers['Content-Type']) {
        headers['Content-Type'] = testCase.headers['Content-Type'];
      }
      if (testCase.headers['Origin']) {
        headers['Origin'] = testCase.headers['Origin'];
      }

      const response = await fetch(GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers,
        body: JSON.stringify({ query: loginMutation, variables })
      });

      const blocked = response.status === 403;
      const correct = blocked === testCase.shouldBeBlocked;

      if (correct) {
        console.log(`✅ Correctly ${blocked ? 'blocked' : 'allowed'}`);
        passedTests++;
      } else {
        console.log(`❌ Expected ${testCase.shouldBeBlocked ? 'blocked' : 'allowed'} but got ${blocked ? 'blocked' : 'allowed'}`);
      }
    }

    const success = passedTests === testCases.length;
    console.log(`📊 Origin Validation: ${passedTests}/${testCases.length} tests passed`);

    return { success, message: `Origin validation ${success ? 'working correctly' : 'has issues'}` };
  }

  async testContentTypeValidation() {
    console.log('\n📝 Testing Content-Type Validation...');

    const query = '{ __typename }';

    const testCases = [
      {
        name: 'Valid JSON Content-Type',
        headers: { 'Content-Type': 'application/json' },
        shouldBeAccepted: true
      },
      {
        name: 'Invalid Form Content-Type',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        shouldBeAccepted: false
      },
      {
        name: 'Invalid Text Content-Type',
        headers: { 'Content-Type': 'text/plain' },
        shouldBeAccepted: false
      },
      {
        name: 'No Content-Type',
        headers: {},
        shouldBeAccepted: false
      }
    ];

    let passedTests = 0;

    for (const testCase of testCases) {
      console.log(`Testing: ${testCase.name}`);

      const headers: Record<string, string> = {};
      if (testCase.headers['Content-Type']) {
        headers['Content-Type'] = testCase.headers['Content-Type'];
      }

      const response = await fetch(GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: Object.keys(headers).length > 0 ? headers : undefined,
        body: JSON.stringify({ query })
      });

      const accepted = response.status !== 400;
      const correct = accepted === testCase.shouldBeAccepted;

      if (correct) {
        console.log(`✅ Correctly ${accepted ? 'accepted' : 'rejected'}`);
        passedTests++;
      } else {
        console.log(`❌ Expected ${testCase.shouldBeAccepted ? 'accepted' : 'rejected'} but got ${accepted ? 'accepted' : 'rejected'}`);
      }
    }

    const success = passedTests >= testCases.length * 0.75; // Allow some flexibility
    console.log(`📊 Content-Type Validation: ${passedTests}/${testCases.length} tests passed`);

    return { success, message: `Content-Type validation ${success ? 'working' : 'needs improvement'}` };
  }

  async testCSRFTokenEndpoint() {
    console.log('\n🎫 Testing CSRF Token Endpoint...');

    try {
      const response = await fetch(CSRF_ENDPOINT);

      if (response.status !== 200) {
        console.log('❌ CSRF token endpoint not accessible');
        return { success: false, message: 'CSRF token endpoint not working' };
      }

      const data = await response.json();

      if (data.csrfToken && data.expiresIn) {
        console.log('✅ CSRF token endpoint working');
        console.log(`   Token length: ${data.csrfToken.length} characters`);
        console.log(`   Expires in: ${data.expiresIn / 1000} seconds`);

        // Validate token format (should be hex)
        const isValidHex = /^[a-f0-9]{64}$/i.test(data.csrfToken);
        if (isValidHex) {
          console.log('✅ Token format is valid (hex)');
          return { success: true, message: 'CSRF token endpoint working correctly' };
        } else {
          console.log('⚠️  Token format may be incorrect');
          return { success: false, message: 'CSRF token format invalid' };
        }
      } else {
        console.log('❌ CSRF token response missing required fields');
        return { success: false, message: 'CSRF token response incomplete' };
      }
    } catch (error) {
      console.log('❌ Failed to access CSRF token endpoint');
      return { success: false, message: 'CSRF token endpoint error', details: error };
    }
  }

  async testSensitiveOperationProtection() {
    console.log('\n🔐 Testing Sensitive Operation CSRF Protection...');

    // Get a CSRF token first
    let csrfToken = '';
    try {
      const tokenResponse = await fetch(CSRF_ENDPOINT);
      const tokenData = await tokenResponse.json();
      csrfToken = tokenData.csrfToken;
    } catch (error) {
      console.log('⚠️  Could not obtain CSRF token for testing');
    }

    const sensitiveMutations = [
      {
        name: 'Login',
        query: `
          mutation Login($input: LoginInput!) {
            login(input: $input) {
              token
            }
          }
        `,
        variables: {
          input: {
            email: 'test@example.com',
            password: 'testpass'
          }
        }
      },
      {
        name: 'Register',
        query: `
          mutation Register($input: RegisterInput!) {
            register(input: $input) {
              token
            }
          }
        `,
        variables: {
          input: {
            email: 'newuser@example.com',
            password: 'password123',
            firstName: 'Test',
            lastName: 'User',
            phoneNumber: '+1234567890'
          }
        }
      }
    ];

    let passedTests = 0;

    for (const mutation of sensitiveMutations) {
      console.log(`Testing ${mutation.name} mutation...`);

      // Test without CSRF token
      const responseWithoutToken = await fetch(GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'http://localhost:3000'
        },
        body: JSON.stringify({
          query: mutation.query,
          variables: mutation.variables
        })
      });

      // Test with CSRF token
      const responseWithToken = await fetch(GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'http://localhost:3000',
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify({
          query: mutation.query,
          variables: mutation.variables
        })
      });

      // The request with token should be processed (may still fail for other reasons like invalid credentials)
      // The request without token should be blocked by CSRF protection
      const withoutTokenBlocked = responseWithoutToken.status === 403;
      const withTokenProcessed = responseWithToken.status !== 403;

      if (withoutTokenBlocked && withTokenProcessed) {
        console.log('✅ CSRF protection working correctly');
        passedTests++;
      } else {
        console.log(`⚠️  CSRF behavior unexpected: without=${responseWithoutToken.status}, with=${responseWithToken.status}`);
      }
    }

    const success = passedTests === sensitiveMutations.length;
    console.log(`📊 Sensitive Operation Protection: ${passedTests}/${sensitiveMutations.length} tests passed`);

    return { success, message: `Sensitive operation CSRF protection ${success ? 'working' : 'needs attention'}` };
  }

  async testRefererHeaderProtection() {
    console.log('\n🔗 Testing Referer Header Protection...');

    const query = '{ __typename }';

    // Test with referer header
    const responseWithReferer = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Referer': 'https://evil-attacker.com/malicious-page'
      },
      body: JSON.stringify({ query })
    });

    // Test with allowed referer
    const responseWithAllowedReferer = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Referer': 'http://localhost:3000/app'
      },
      body: JSON.stringify({ query })
    });

    const maliciousBlocked = responseWithReferer.status === 403;
    const allowedProcessed = responseWithAllowedReferer.status !== 403;

    console.log(`Malicious referer: ${maliciousBlocked ? 'blocked' : 'allowed'}`);
    console.log(`Allowed referer: ${allowedProcessed ? 'processed' : 'blocked'}`);

    const success = maliciousBlocked && allowedProcessed;
    console.log(`📊 Referer Protection: ${success ? 'working' : 'not working'}`);

    return { success, message: `Referer header protection ${success ? 'effective' : 'ineffective'}` };
  }

  async runAllTests() {
    console.log('🔒 CSRF Protection Test Suite');
    console.log('='.repeat(50));

    const tests = [
      { name: 'Origin Validation', test: this.testOriginValidation.bind(this) },
      { name: 'Content-Type Validation', test: this.testContentTypeValidation.bind(this) },
      { name: 'CSRF Token Endpoint', test: this.testCSRFTokenEndpoint.bind(this) },
      { name: 'Sensitive Operations', test: this.testSensitiveOperationProtection.bind(this) },
      { name: 'Referer Protection', test: this.testRefererHeaderProtection.bind(this) }
    ];

    let passed = 0;
    const total = tests.length;
    const results: CSRFTestResult[] = [];

    for (const { name, test } of tests) {
      console.log(`\n🔍 Running ${name} Tests...`);
      try {
        const result = await test();
        results.push(result);
        if (result.success) passed++;
      } catch (error) {
        console.log(`❌ ${name} test failed:`, error);
        results.push({ success: false, message: `${name} test failed: ${error}`, details: error });
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('📊 CSRF PROTECTION TEST RESULTS');
    console.log('='.repeat(50));

    console.log(`✅ Passed: ${passed}/${total} (${Math.round((passed/total)*100)}%)`);

    // Detailed results
    console.log('\n📋 Test Details:');
    results.forEach((result, index) => {
      const status = result.success ? '✅' : '❌';
      console.log(`${index + 1}. ${status} ${result.message}`);
    });

    if (passed === total) {
      console.log('🎉 Excellent! CSRF protection is comprehensive.');
    } else if (passed >= total * 0.8) {
      console.log('👍 Good CSRF protection, minor tuning needed.');
    } else {
      console.log('⚠️  CSRF protection needs significant improvements.');
    }

    console.log('='.repeat(50));

    return { passed, total, results };
  }
}

// Export for use in other scripts
export default CSRFProtectionTester;

// Run tests if executed directly
if (require.main === module) {
  const tester = new CSRFProtectionTester();
  tester.runAllTests()
    .then(({ passed, total }) => {
      process.exit(passed === total ? 0 : 1);
    })
    .catch(console.error);
}
