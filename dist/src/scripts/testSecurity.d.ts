#!/usr/bin/env ts-node
/**
 * Comprehensive Security Test Suite
 *
 * Tests all security features including authentication, authorization,
 * input validation, and data protection
 */
declare class SecurityTester {
    private tests;
    private results;
    constructor();
    private addTest;
    private runTest;
    private setupTests;
    private testAuthenticationRequired;
    private testInvalidJWT;
    private testAdminProtection;
    private testSQLInjection;
    private testXSSPrevention;
    private testPasswordProtection;
    private testFileUploadValidation;
    private testErrorDisclosure;
    private testSecurityHeaders;
    runAllTests(): Promise<{
        passed: number;
        total: number;
        score: number;
    }>;
}
export default SecurityTester;
//# sourceMappingURL=testSecurity.d.ts.map