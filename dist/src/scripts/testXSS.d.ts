#!/usr/bin/env ts-node
/**
 * XSS (Cross-Site Scripting) Protection Test
 *
 * Tests Content Security Policy, input sanitization, and XSS prevention
 */
declare class XSSTester {
    private xssPayloads;
    testCSPHeaders(): Promise<boolean>;
    testXSSPayloads(): Promise<boolean>;
    testInputSanitization(): Promise<boolean>;
    testSecurityHeaders(): Promise<boolean>;
    runAllTests(): Promise<{
        passed: number;
        total: number;
    }>;
}
export default XSSTester;
//# sourceMappingURL=testXSS.d.ts.map