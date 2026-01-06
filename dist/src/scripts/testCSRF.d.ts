#!/usr/bin/env ts-node
/**
 * CSRF (Cross-Site Request Forgery) Protection Test
 *
 * Tests origin validation, CSRF tokens, and cross-origin request protection
 */
interface CSRFTestResult {
    success: boolean;
    message: string;
    details?: any;
}
declare class CSRFProtectionTester {
    testOriginValidation(): Promise<{
        success: boolean;
        message: string;
    }>;
    testContentTypeValidation(): Promise<{
        success: boolean;
        message: string;
    }>;
    testCSRFTokenEndpoint(): Promise<{
        success: boolean;
        message: string;
        details?: undefined;
    } | {
        success: boolean;
        message: string;
        details: unknown;
    }>;
    testSensitiveOperationProtection(): Promise<{
        success: boolean;
        message: string;
    }>;
    testRefererHeaderProtection(): Promise<{
        success: boolean;
        message: string;
    }>;
    runAllTests(): Promise<{
        passed: number;
        total: number;
        results: CSRFTestResult[];
    }>;
}
export default CSRFProtectionTester;
//# sourceMappingURL=testCSRF.d.ts.map