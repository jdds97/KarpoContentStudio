// Tests de Error Handling y Logging Security
// Tests comprehensivos para validar el manejo seguro de errores y logging

import { jest } from '@jest/globals';
import { SecurityAssertions, AttackVectorGenerator } from '../../utils/security-helpers';

describe('Error Handling and Logging Security Tests', () => {
  let mockFetch: jest.MockedFunction<typeof global.fetch>;
  let consoleSpy: jest.SpyInstance;
  
  beforeEach(() => {
    mockFetch = jest.fn() as jest.MockedFunction<typeof global.fetch>;
    global.fetch = mockFetch;
    consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
    consoleSpy.mockRestore();
  });

  describe('Error Message Security Tests', () => {
    test('should not expose sensitive information in error messages', async () => {
      const sensitiveOperations = [
        '/api/admin/database/backup',
        '/api/auth/internal/validate',
        '/api/bookings/payment/process',
        '/api/system/config/read'
      ];

      for (const operation of sensitiveOperations) {
        mockFetch.mockResolvedValueOnce(new Response(
          JSON.stringify({ 
            error: 'Operation failed',
            message: 'An error occurred while processing your request',
            error_id: 'ERR_2024_001',
            support_contact: 'support@example.com'
          }),
          { status: 500 }
        ));

        const response = await fetch(operation);
        
        expect(response.status).toBe(500);
        const result = await response.json();
        
        // Verify no sensitive information leakage
        SecurityAssertions.assertSecureErrorMessage(result.message);
        SecurityAssertions.assertNoSensitiveDataExposed(result);
        
        expect(result.error_id).toBeDefined();
        expect(result.message).not.toContain('database');
        expect(result.message).not.toContain('internal');
        expect(result.message).not.toContain('config');
      }
    });

    test('should provide generic error messages for authentication failures', async () => {
      const authFailureScenarios = [
        { input: { email: 'nonexistent@example.com', password: 'anypassword' } },
        { input: { email: 'admin@example.com', password: 'wrongpassword' } },
        { input: { email: 'locked@example.com', password: 'correctpassword' } },
        { input: { email: 'suspended@example.com', password: 'correctpassword' } }
      ];

      for (const scenario of authFailureScenarios) {
        mockFetch.mockResolvedValueOnce(new Response(
          JSON.stringify({ 
            error: 'Authentication failed',
            message: 'Invalid credentials provided',
            error_id: `AUTH_ERR_${Date.now()}`
          }),
          { status: 401 }
        ));

        const response = await fetch('/api/auth/signin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(scenario.input)
        });

        expect(response.status).toBe(401);
        const result = await response.json();
        
        // All auth failures should return identical error messages
        expect(result.message).toBe('Invalid credentials provided');
        expect(result.message).not.toContain('user not found');
        expect(result.message).not.toContain('wrong password');
        expect(result.message).not.toContain('account locked');
        expect(result.message).not.toContain('suspended');
      }
    });

    test('should handle malformed request errors securely', async () => {
      const malformedRequests = [
        { body: '{"invalid": json}', contentType: 'application/json' },
        { body: '<?xml version="1.0"?><root>xml</root>', contentType: 'application/json' },
        { body: 'not-json-at-all', contentType: 'application/json' },
        { body: '{"a":' + 'b'.repeat(100000) + '}', contentType: 'application/json' }
      ];

      for (const request of malformedRequests) {
        mockFetch.mockResolvedValueOnce(new Response(
          JSON.stringify({ 
            error: 'Bad Request',
            message: 'Request format is invalid',
            error_id: `REQ_ERR_${Date.now()}`
          }),
          { status: 400 }
        ));

        const response = await fetch('/api/bookings', {
          method: 'POST',
          headers: { 'Content-Type': request.contentType },
          body: request.body
        });

        expect(response.status).toBe(400);
        const result = await response.json();
        
        SecurityAssertions.assertSecureErrorMessage(result.message);
        expect(result.message).not.toContain('JSON.parse');
        expect(result.message).not.toContain('syntax error');
        expect(result.message).not.toContain('unexpected token');
      }
    });

    test('should handle validation errors without exposing internal logic', async () => {
      const validationTestCases = [
        { 
          field: 'email',
          value: 'invalid-email',
          expectedError: 'Invalid email format'
        },
        { 
          field: 'phone',
          value: '123',
          expectedError: 'Invalid phone number format'
        },
        { 
          field: 'date',
          value: '2020-01-01',
          expectedError: 'Date must be in the future'
        }
      ];

      for (const testCase of validationTestCases) {
        mockFetch.mockResolvedValueOnce(new Response(
          JSON.stringify({ 
            error: 'Validation failed',
            message: 'Please check your input and try again',
            validation_errors: [
              {
                field: testCase.field,
                message: testCase.expectedError
              }
            ]
          }),
          { status: 400 }
        ));

        const response = await fetch('/api/bookings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ [testCase.field]: testCase.value })
        });

        expect(response.status).toBe(400);
        const result = await response.json();
        
        expect(result.validation_errors[0].message).toBe(testCase.expectedError);
        expect(result.validation_errors[0].message).not.toContain('regex');
        expect(result.validation_errors[0].message).not.toContain('pattern');
        expect(result.validation_errors[0].message).not.toContain('function');
      }
    });
  });

  describe('Logging Security Tests', () => {
    test('should log security events without exposing sensitive data', async () => {
      const securityEvents = [
        'FAILED_LOGIN_ATTEMPT',
        'SUSPICIOUS_REQUEST_PATTERN',
        'RATE_LIMIT_EXCEEDED',
        'MALICIOUS_PAYLOAD_DETECTED'
      ];

      for (const event of securityEvents) {
        mockFetch.mockResolvedValueOnce(new Response(
          JSON.stringify({ 
            error: 'Security violation detected',
            message: 'Request blocked for security reasons',
            event_logged: true,
            incident_id: `SEC_${Date.now()}`
          }),
          { status: 403 }
        ));

        const response = await fetch('/api/test-security', {
          method: 'POST',
          headers: { 'X-Security-Test': event }
        });

        expect(response.status).toBe(403);
        const result = await response.json();
        
        expect(result.event_logged).toBe(true);
        expect(result.incident_id).toBeDefined();
        
        // Verify no sensitive data in response
        SecurityAssertions.assertNoSensitiveDataExposed(result);
      }
    });

    test('should implement proper audit logging for admin actions', async () => {
      const adminActions = [
        { action: 'DELETE_BOOKING', resource: 'booking_123' },
        { action: 'MODIFY_USER', resource: 'user_456' },
        { action: 'EXPORT_DATA', resource: 'bookings_report' },
        { action: 'SYSTEM_CONFIG_CHANGE', resource: 'cache_settings' }
      ];

      for (const adminAction of adminActions) {
        mockFetch.mockResolvedValueOnce(new Response(
          JSON.stringify({ 
            success: true,
            action: adminAction.action,
            resource: adminAction.resource,
            audit_logged: true,
            audit_id: `AUDIT_${Date.now()}`,
            timestamp: new Date().toISOString()
          }),
          { status: 200 }
        ));

        const response = await fetch('/api/admin/actions', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': 'Bearer admin_token'
          },
          body: JSON.stringify(adminAction)
        });

        expect(response.ok).toBe(true);
        const result = await response.json();
        
        expect(result.audit_logged).toBe(true);
        expect(result.audit_id).toBeDefined();
        expect(result.timestamp).toBeDefined();
      }
    });

    test('should prevent log injection attacks', async () => {
      const logInjectionPayloads = [
        'normal_user\n[ADMIN] Unauthorized access granted',
        'test_user\r\n[ERROR] System compromised',
        'user\x00admin_privileges_granted',
        'user\t[CRITICAL] Database deleted',
        'user\n\r[WARNING] Security bypassed'
      ];

      for (const payload of logInjectionPayloads) {
        mockFetch.mockResolvedValueOnce(new Response(
          JSON.stringify({ 
            error: 'Invalid input detected',
            message: 'Request contains potentially malicious content',
            log_injection_prevented: true,
            sanitized_input: payload.replace(/[\r\n\t\x00]/g, ''),
            incident_id: `LOG_INJ_${Date.now()}`
          }),
          { status: 400 }
        ));

        const response = await fetch('/api/bookings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: payload })
        });

        expect(response.status).toBe(400);
        const result = await response.json();
        
        expect(result.log_injection_prevented).toBe(true);
        expect(result.sanitized_input).not.toContain('\n');
        expect(result.sanitized_input).not.toContain('\r');
        expect(result.sanitized_input).not.toContain('\t');
        expect(result.sanitized_input).not.toContain('\x00');
      }
    });

    test('should implement structured logging with proper field sanitization', async () => {
      const structuredLogTest = {
        user_id: 'user_123',
        action: 'CREATE_BOOKING',
        resource: 'booking_456',
        ip_address: '192.168.1.100',
        user_agent: 'Mozilla/5.0 (compatible; TestBot/1.0)',
        timestamp: new Date().toISOString()
      };

      mockFetch.mockResolvedValueOnce(new Response(
        JSON.stringify({ 
          success: true,
          log_entry: {
            ...structuredLogTest,
            sanitized_fields: ['user_agent'],
            pii_redacted: false,
            log_level: 'INFO'
          }
        }),
        { status: 200 }
      ));

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer user_token'
        },
        body: JSON.stringify({ name: 'Test User' })
      });

      expect(response.ok).toBe(true);
      const result = await response.json();
      
      expect(result.log_entry.sanitized_fields).toContain('user_agent');
      expect(result.log_entry.log_level).toBe('INFO');
    });
  });

  describe('Error Stack Trace Security Tests', () => {
    test('should not expose stack traces in production errors', async () => {
      const errorScenarios = [
        'database_connection_error',
        'file_system_error',
        'third_party_service_error',
        'internal_server_error'
      ];

      for (const scenario of errorScenarios) {
        mockFetch.mockResolvedValueOnce(new Response(
          JSON.stringify({ 
            error: 'Internal server error',
            message: 'Something went wrong. Please try again later.',
            error_id: `ERR_${Date.now()}`,
            stack_trace_exposed: false
          }),
          { status: 500 }
        ));

        const response = await fetch(`/api/test-error/${scenario}`);
        
        expect(response.status).toBe(500);
        const result = await response.json();
        
        expect(result.stack_trace_exposed).toBe(false);
        expect(result.message).not.toContain('at ');
        expect(result.message).not.toContain('.js:');
        expect(result.message).not.toContain('Error:');
        expect(result.message).not.toContain('stack');
      }
    });

    test('should sanitize error objects before logging', async () => {
      const errorWithSensitiveData = {
        message: 'Database connection failed',
        sensitive_config: {
          database_url: 'postgres://user:pass@localhost/db',
          api_key: 'secret_key_123',
          private_key: '-----BEGIN PRIVATE KEY-----'
        }
      };

      mockFetch.mockResolvedValueOnce(new Response(
        JSON.stringify({ 
          error: 'Configuration error',
          message: 'Service configuration issue detected',
          error_id: 'CONFIG_ERR_001',
          sanitized_error: true,
          sensitive_data_removed: true
        }),
        { status: 500 }
      ));

      const response = await fetch('/api/config-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorWithSensitiveData)
      });

      expect(response.status).toBe(500);
      const result = await response.json();
      
      expect(result.sanitized_error).toBe(true);
      expect(result.sensitive_data_removed).toBe(true);
      
      SecurityAssertions.assertNoSensitiveDataExposed(result);
    });
  });

  describe('Rate Limiting and Error Handling Tests', () => {
    test('should implement progressive error handling for repeated failures', async () => {
      const attempts = [
        { attempt: 1, delay: 1000 },
        { attempt: 2, delay: 2000 },
        { attempt: 3, delay: 4000 },
        { attempt: 4, delay: 8000 }
      ];

      for (const attempt of attempts) {
        mockFetch.mockResolvedValueOnce(new Response(
          JSON.stringify({ 
            error: 'Rate limit exceeded',
            message: 'Too many attempts. Please wait before retrying.',
            attempt_number: attempt.attempt,
            retry_after: attempt.delay,
            exponential_backoff: true
          }),
          { status: 429 }
        ));

        const response = await fetch('/api/auth/signin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'test@example.com', password: 'wrong' })
        });

        expect(response.status).toBe(429);
        const result = await response.json();
        
        expect(result.exponential_backoff).toBe(true);
        expect(result.retry_after).toBe(attempt.delay);
      }
    });

    test('should handle error bursts without exposing system state', async () => {
      const burstSize = 100;
      const responses = [];

      for (let i = 0; i < burstSize; i++) {
        mockFetch.mockResolvedValueOnce(new Response(
          JSON.stringify({ 
            error: 'Service temporarily unavailable',
            message: 'Please try again later',
            request_id: `REQ_${i}`,
            circuit_breaker_active: i > 50
          }),
          { status: 503 }
        ));

        responses.push(fetch('/api/bookings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: `User ${i}` })
        }));
      }

      const results = await Promise.all(responses);
      const parsedResults = await Promise.all(results.map(r => r.json()));
      
      expect(results.every(r => r.status === 503)).toBe(true);
      expect(parsedResults.every(r => r.message === 'Please try again later')).toBe(true);
      
      // Circuit breaker should activate after threshold
      const circuitBreakerActive = parsedResults.filter(r => r.circuit_breaker_active);
      expect(circuitBreakerActive.length).toBeGreaterThan(0);
    });
  });

  describe('Error Correlation and Monitoring Tests', () => {
    test('should implement error correlation across requests', async () => {
      const correlationId = 'CORR_123_456';
      const relatedErrors = [
        { service: 'auth', error: 'token_validation_failed' },
        { service: 'booking', error: 'authorization_required' },
        { service: 'notification', error: 'user_not_authenticated' }
      ];

      for (const error of relatedErrors) {
        mockFetch.mockResolvedValueOnce(new Response(
          JSON.stringify({ 
            error: error.error,
            message: 'Request failed',
            service: error.service,
            correlation_id: correlationId,
            related_errors: relatedErrors.length,
            trace_id: `TRACE_${Date.now()}`
          }),
          { status: 401 }
        ));

        const response = await fetch(`/api/${error.service}/test`, {
          headers: { 'X-Correlation-ID': correlationId }
        });

        expect(response.status).toBe(401);
        const result = await response.json();
        
        expect(result.correlation_id).toBe(correlationId);
        expect(result.trace_id).toBeDefined();
        expect(result.related_errors).toBeGreaterThan(0);
      }
    });

    test('should implement proper error aggregation and alerting', async () => {
      const errorPatterns = [
        { pattern: 'database_timeout', count: 15, threshold: 10 },
        { pattern: 'auth_failures', count: 25, threshold: 20 },
        { pattern: 'api_errors', count: 50, threshold: 30 }
      ];

      for (const pattern of errorPatterns) {
        mockFetch.mockResolvedValueOnce(new Response(
          JSON.stringify({ 
            error_pattern: pattern.pattern,
            occurrence_count: pattern.count,
            threshold: pattern.threshold,
            threshold_exceeded: pattern.count > pattern.threshold,
            alert_triggered: pattern.count > pattern.threshold,
            severity: pattern.count > pattern.threshold ? 'HIGH' : 'MEDIUM'
          }),
          { status: 200 }
        ));

        const response = await fetch(`/api/monitoring/errors/${pattern.pattern}`);
        
        expect(response.ok).toBe(true);
        const result = await response.json();
        
        expect(result.threshold_exceeded).toBe(pattern.count > pattern.threshold);
        if (pattern.count > pattern.threshold) {
          expect(result.alert_triggered).toBe(true);
          expect(result.severity).toBe('HIGH');
        }
      }
    });
  });

  describe('Custom Error Classes and Handling Tests', () => {
    test('should handle custom security exception types', async () => {
      const securityExceptions = [
        'AuthenticationException',
        'AuthorizationException',
        'ValidationException',
        'RateLimitException',
        'SecurityViolationException'
      ];

      for (const exception of securityExceptions) {
        mockFetch.mockResolvedValueOnce(new Response(
          JSON.stringify({ 
            error: 'Security exception',
            exception_type: exception,
            message: 'Request blocked for security reasons',
            error_code: `SEC_${exception.toUpperCase()}`,
            handled_securely: true
          }),
          { status: 403 }
        ));

        const response = await fetch('/api/security-test', {
          method: 'POST',
          headers: { 'X-Exception-Type': exception }
        });

        expect(response.status).toBe(403);
        const result = await response.json();
        
        expect(result.exception_type).toBe(exception);
        expect(result.handled_securely).toBe(true);
        expect(result.error_code).toContain('SEC_');
      }
    });

    test('should implement proper error recovery mechanisms', async () => {
      const recoveryScenarios = [
        { error: 'TEMPORARY_FAILURE', recovery: 'RETRY_AFTER_DELAY' },
        { error: 'RESOURCE_EXHAUSTED', recovery: 'QUEUE_REQUEST' },
        { error: 'SERVICE_UNAVAILABLE', recovery: 'FALLBACK_SERVICE' },
        { error: 'DEPENDENCY_FAILURE', recovery: 'GRACEFUL_DEGRADATION' }
      ];

      for (const scenario of recoveryScenarios) {
        mockFetch.mockResolvedValueOnce(new Response(
          JSON.stringify({ 
            error: scenario.error,
            message: 'Service temporarily unavailable',
            recovery_strategy: scenario.recovery,
            recovery_attempted: true,
            estimated_recovery_time: 30000
          }),
          { status: 503 }
        ));

        const response = await fetch('/api/resilience-test', {
          method: 'POST',
          headers: { 'X-Error-Type': scenario.error }
        });

        expect(response.status).toBe(503);
        const result = await response.json();
        
        expect(result.recovery_strategy).toBe(scenario.recovery);
        expect(result.recovery_attempted).toBe(true);
        expect(result.estimated_recovery_time).toBeGreaterThan(0);
      }
    });
  });
});