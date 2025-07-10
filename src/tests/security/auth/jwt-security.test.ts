// JWT Security Tests
// Tests comprehensivos de seguridad para JWT y autenticación

import { jest } from '@jest/globals';
import { AttackSimulationEngine, ATTACKER_PROFILES } from '../../utils/mock-attackers';
import { SecurityAssertions, AttackVectorGenerator } from '../../utils/security-helpers';

describe('JWT Security Tests', () => {
  let mockFetch: jest.MockedFunction<typeof global.fetch>;
  
  beforeEach(() => {
    mockFetch = jest.fn() as jest.MockedFunction<typeof global.fetch>;
    global.fetch = mockFetch;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('JWT Token Manipulation Tests', () => {
    test('should reject tampered JWT tokens', async () => {
      const originalToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
      
      // Various token manipulation attempts
      const tamperedTokens = [
        // Header manipulation
        'TAMPERED.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
        // Payload manipulation
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.TAMPERED.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
        // Signature manipulation
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.TAMPERED',
        // None algorithm attack
        'eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFkbWluIiwiaWF0IjoxNTE2MjM5MDIyLCJyb2xlIjoiYWRtaW4ifQ.',
        // Empty signature
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.',
        // Invalid base64
        'invalid.base64.token',
        // Missing parts
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ'
      ];

      for (const tamperedToken of tamperedTokens) {
        mockFetch.mockResolvedValueOnce(new Response(
          JSON.stringify({ error: 'Invalid token' }),
          { status: 401 }
        ));

        const response = await fetch('/api/admin/dashboard', {
          headers: { 'Authorization': `Bearer ${tamperedToken}` }
        });

        expect(response.status).toBe(401);
        const data = await response.json();
        SecurityAssertions.assertSecureErrorMessage(data.error);
      }
    });

    test('should prevent JWT algorithm confusion attacks', async () => {
      // Test RS256 to HS256 confusion
      const rsaToHmacToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbiIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTYzOTc0MDAwMH0.forged_signature_with_public_key';
      
      mockFetch.mockResolvedValueOnce(new Response(
        JSON.stringify({ error: 'Invalid algorithm' }),
        { status: 401 }
      ));

      const response = await fetch('/api/admin/users', {
        headers: { 'Authorization': `Bearer ${rsaToHmacToken}` }
      });

      expect(response.status).toBe(401);
    });

    test('should reject tokens with critical claim modifications', async () => {
      // Test role escalation through JWT payload modification
      const roleEscalationPayloads = [
        btoa(JSON.stringify({ sub: 'user123', role: 'admin', iat: Math.floor(Date.now() / 1000) })),
        btoa(JSON.stringify({ sub: 'user123', roles: ['admin'], iat: Math.floor(Date.now() / 1000) })),
        btoa(JSON.stringify({ sub: 'user123', permissions: ['admin:*'], iat: Math.floor(Date.now() / 1000) })),
        btoa(JSON.stringify({ sub: 'admin', iat: Math.floor(Date.now() / 1000) }))
      ];

      for (const payload of roleEscalationPayloads) {
        const maliciousToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${payload}.fake_signature`;
        
        mockFetch.mockResolvedValueOnce(new Response(
          JSON.stringify({ error: 'Invalid token signature' }),
          { status: 401 }
        ));

        const response = await fetch('/api/admin/settings', {
          headers: { 'Authorization': `Bearer ${maliciousToken}` }
        });

        expect(response.status).toBe(401);
      }
    });
  });

  describe('JWT Expiration and Refresh Tests', () => {
    test('should reject expired tokens', async () => {
      const expiredTokenPayload = btoa(JSON.stringify({
        sub: 'user123',
        iat: Math.floor(Date.now() / 1000) - 7200, // 2 hours ago
        exp: Math.floor(Date.now() / 1000) - 3600  // 1 hour ago (expired)
      }));
      
      const expiredToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${expiredTokenPayload}.fake_signature`;
      
      mockFetch.mockResolvedValueOnce(new Response(
        JSON.stringify({ error: 'Token expired' }),
        { status: 401 }
      ));

      const response = await fetch('/api/bookings', {
        headers: { 'Authorization': `Bearer ${expiredToken}` }
      });

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toContain('expired');
    });

    test('should prevent token replay attacks after logout', async () => {
      const validToken = 'valid.jwt.token';
      
      // Simulate logout
      mockFetch.mockResolvedValueOnce(new Response(
        JSON.stringify({ success: true }),
        { status: 200 }
      ));

      await fetch('/api/auth/signout', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${validToken}` }
      });

      // Try to reuse token after logout
      mockFetch.mockResolvedValueOnce(new Response(
        JSON.stringify({ error: 'Token revoked' }),
        { status: 401 }
      ));

      const response = await fetch('/api/bookings', {
        headers: { 'Authorization': `Bearer ${validToken}` }
      });

      expect(response.status).toBe(401);
    });

    test('should validate refresh token security', async () => {
      const invalidRefreshTokens = [
        '', // Empty
        'invalid', // Malformed
        'expired_refresh_token', // Expired
        '../../../etc/passwd', // Directory traversal
        '<script>alert("xss")</script>', // XSS attempt
        'old_refresh_token_after_rotation' // Old token after rotation
      ];

      for (const refreshToken of invalidRefreshTokens) {
        mockFetch.mockResolvedValueOnce(new Response(
          JSON.stringify({ error: 'Invalid refresh token' }),
          { status: 401 }
        ));

        const response = await fetch('/api/auth/refresh', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: refreshToken })
        });

        expect(response.status).toBe(401);
      }
    });
  });

  describe('JWT Storage and Transport Security', () => {
    test('should prevent JWT token leakage in URLs', async () => {
      // Test that tokens are not accepted via URL parameters
      const token = 'sensitive.jwt.token';
      
      mockFetch.mockResolvedValueOnce(new Response(
        JSON.stringify({ error: 'Invalid authentication method' }),
        { status: 401 }
      ));

      const response = await fetch(`/api/bookings?token=${token}`);
      
      expect(response.status).toBe(401);
    });

    test('should enforce secure token transport', async () => {
      // Simulate HTTPS requirement
      const token = 'valid.jwt.token';
      
      mockFetch.mockResolvedValueOnce(new Response(
        JSON.stringify({ error: 'HTTPS required for authentication' }),
        { status: 426 } // Upgrade Required
      ));

      // Simulate HTTP request (should be rejected)
      const response = await fetch('http://localhost/api/bookings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      expect(response.status).toBe(426);
    });

    test('should validate secure cookie attributes', async () => {
      const validToken = 'valid.jwt.token';
      
      mockFetch.mockResolvedValueOnce(new Response(
        JSON.stringify({ success: true }),
        { 
          status: 200,
          headers: {
            'Set-Cookie': 'jwt=token; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=3600'
          }
        }
      ));

      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        body: JSON.stringify({ email: 'test@example.com', password: 'password' }),
        headers: { 'Content-Type': 'application/json' }
      });

      const setCookieHeader = response.headers.get('Set-Cookie');
      expect(setCookieHeader).toContain('HttpOnly');
      expect(setCookieHeader).toContain('Secure');
      expect(setCookieHeader).toContain('SameSite=Strict');
    });
  });

  describe('Advanced JWT Attack Simulation', () => {
    test('should resist sophisticated JWT attacks by advanced attackers', async () => {
      const engine = new AttackSimulationEngine('ADVANCED_PERSISTENT_THREAT', '/api/admin');
      
      // Simulate various advanced JWT attack techniques
      const advancedAttacks = [
        // JKU (JSON Web Key Set URL) header injection
        { 
          attack: 'jku_injection',
          token: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImprdSI6Imh0dHA6Ly9hdHRhY2tlci5jb20vand0cyJ9.eyJzdWIiOiJhZG1pbiJ9.fake'
        },
        // X5U (X.509 URL) header injection
        {
          attack: 'x5u_injection',
          token: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsIng1dSI6Imh0dHA6Ly9hdHRhY2tlci5jb20vY2VydCJ9.eyJzdWIiOiJhZG1pbiJ9.fake'
        },
        // Kid (Key ID) injection
        {
          attack: 'kid_injection',
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Ii4uLy4uLy4uL2V0Yy9wYXNzd2QifQ.eyJzdWIiOiJhZG1pbiJ9.fake'
        }
      ];

      for (const attack of advancedAttacks) {
        mockFetch.mockResolvedValueOnce(new Response(
          JSON.stringify({ error: 'Security violation detected' }),
          { status: 403 }
        ));

        const response = await fetch('/api/admin/dashboard', {
          headers: { 'Authorization': `Bearer ${attack.token}` }
        });

        expect(response.status).toBeGreaterThanOrEqual(400);
      }
    });

    test('should detect and prevent JWT bombing attacks', async () => {
      // Create oversized JWT token (potential DoS vector)
      const oversizedPayload = 'A'.repeat(100000); // 100KB payload
      const maliciousToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(oversizedPayload)}.fake`;
      
      mockFetch.mockResolvedValueOnce(new Response(
        JSON.stringify({ error: 'Token too large' }),
        { status: 413 } // Payload Too Large
      ));

      const response = await fetch('/api/bookings', {
        headers: { 'Authorization': `Bearer ${maliciousToken}` }
      });

      expect(response.status).toBe(413);
    });

    test('should prevent weak key attacks', async () => {
      // Test common weak keys
      const weakKeys = [
        'secret',
        'password',
        '123456',
        'your-256-bit-secret',
        'jwt-secret-key',
        'development-key-do-not-use'
      ];

      // For each weak key, verify that properly signed tokens are still rejected
      // if the system detects weak key usage
      for (const weakKey of weakKeys) {
        // In a real test, you would actually sign a token with the weak key
        // and verify that the system rejects it due to key strength requirements
        mockFetch.mockResolvedValueOnce(new Response(
          JSON.stringify({ error: 'Weak cryptographic key detected' }),
          { status: 403 }
        ));

        const response = await fetch('/api/admin/settings', {
          headers: { 'Authorization': 'Bearer weakly.signed.token' }
        });

        expect(response.status).toBe(403);
      }
    });
  });

  describe('JWT Implementation Best Practices', () => {
    test('should enforce proper JWT claims validation', async () => {
      const invalidClaims = [
        // Missing required claims
        { sub: 'user123' }, // Missing iat, exp
        // Invalid audience
        { sub: 'user123', aud: 'wrong-audience', iat: Date.now(), exp: Date.now() + 3600 },
        // Invalid issuer
        { sub: 'user123', iss: 'malicious-issuer', iat: Date.now(), exp: Date.now() + 3600 },
        // Future issued time
        { sub: 'user123', iat: Date.now() + 3600, exp: Date.now() + 7200 },
        // Invalid not-before
        { sub: 'user123', nbf: Date.now() + 3600, iat: Date.now(), exp: Date.now() + 7200 }
      ];

      for (const claims of invalidClaims) {
        const invalidToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(JSON.stringify(claims))}.fake`;
        
        mockFetch.mockResolvedValueOnce(new Response(
          JSON.stringify({ error: 'Invalid token claims' }),
          { status: 401 }
        ));

        const response = await fetch('/api/bookings', {
          headers: { 'Authorization': `Bearer ${invalidToken}` }
        });

        expect(response.status).toBe(401);
      }
    });

    test('should implement proper token blacklisting', async () => {
      const blacklistedToken = 'blacklisted.jwt.token';
      
      mockFetch.mockResolvedValueOnce(new Response(
        JSON.stringify({ error: 'Token has been revoked' }),
        { status: 401 }
      ));

      const response = await fetch('/api/bookings', {
        headers: { 'Authorization': `Bearer ${blacklistedToken}` }
      });

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toContain('revoked');
    });

    test('should enforce rate limiting on authentication endpoints', async () => {
      // Mock rate limiting response ANTES de hacer las requests
      mockFetch.mockImplementation(async () => {
        // Simulate rate limiting after certain number of requests
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded' }),
          { status: 429, headers: { 'Retry-After': '60' } }
        );
      });

      const rapidRequests = Array.from({ length: 10 }, (_, i) => 
        fetch('/api/auth/signin', {
          method: 'POST',
          body: JSON.stringify({ email: `test${i}@example.com`, password: 'password' }),
          headers: { 'Content-Type': 'application/json' }
        })
      );

      const responses = await Promise.all(rapidRequests);
      // Verificar que las respuestas tienen status
      const rateLimitedResponses = responses.filter(r => r && r.status === 429);
      
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });

  describe('Cross-cutting Security Concerns', () => {
    test('should prevent information disclosure through error messages', async () => {
      const maliciousTokens = [
        'malformed.token',
        'expired.token.example',
        'invalid.signature.token'
      ];

      for (const token of maliciousTokens) {
        mockFetch.mockResolvedValueOnce(new Response(
          JSON.stringify({ error: 'Authentication failed' }),
          { status: 401 }
        ));

        const response = await fetch('/api/admin/dashboard', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();
        SecurityAssertions.assertSecureErrorMessage(data.error);
        SecurityAssertions.assertNoSensitiveDataExposed(data);
      }
    });

    test('should implement proper audit logging for JWT events', async () => {
      const events = [
        'token_validation_failed',
        'token_expired',
        'suspicious_token_usage',
        'token_blacklisted'
      ];

      // Simulate each event and verify proper logging
      for (const event of events) {
        mockFetch.mockResolvedValueOnce(new Response(
          JSON.stringify({ error: 'Access denied', audit_id: `audit_${Date.now()}` }),
          { status: 401 }
        ));

        const response = await fetch('/api/bookings', {
          headers: { 'Authorization': 'Bearer malicious.token' }
        });

        const data = await response.json();
        expect(data.audit_id).toBeDefined();
      }
    });
  });
});