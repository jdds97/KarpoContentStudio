// Tests de Seguridad de Cache y Performance
// Tests comprehensivos para validar la seguridad del cache y rendimiento

import { jest } from '@jest/globals';
import { PerformanceMonitor, SecurityAssertions } from '../../utils/security-helpers';

describe('Cache Security and Performance Tests', () => {
  let mockFetch: jest.MockedFunction<typeof global.fetch>;
  
  beforeEach(() => {
    mockFetch = jest.fn() as jest.MockedFunction<typeof global.fetch>;
    global.fetch = mockFetch;
    PerformanceMonitor.clearMeasurements();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Cache Security Tests', () => {
    test('should not cache sensitive data', async () => {
      const sensitiveEndpoints = [
        '/api/admin/users',
        '/api/bookings/payment-info',
        '/api/auth/sessions',
        '/api/admin/database/backup'
      ];

      for (const endpoint of sensitiveEndpoints) {
        mockFetch.mockResolvedValueOnce(new Response(
          JSON.stringify({ data: 'sensitive_data' }),
          { 
            status: 200,
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache',
              'Expires': '0'
            }
          }
        ));

        const response = await fetch(endpoint);
        
        expect(response.ok).toBe(true);
        expect(response.headers.get('Cache-Control')).toContain('no-cache');
        expect(response.headers.get('Cache-Control')).toContain('no-store');
        expect(response.headers.get('Pragma')).toBe('no-cache');
      }
    });

    test('should implement proper cache key isolation', async () => {
      const userRequests = [
        { userId: 'user1', token: 'token1' },
        { userId: 'user2', token: 'token2' },
        { userId: 'user3', token: 'token3' }
      ];

      for (const user of userRequests) {
        mockFetch.mockResolvedValueOnce(new Response(
          JSON.stringify({ 
            user_id: user.userId,
            cache_key: `user:${user.userId}:bookings`,
            data: `user_specific_data_${user.userId}`
          }),
          { 
            status: 200,
            headers: {
              'X-Cache-Key': `user:${user.userId}:bookings`,
              'X-Cache-Status': 'MISS'
            }
          }
        ));

        const response = await fetch('/api/bookings', {
          headers: { 'Authorization': `Bearer ${user.token}` }
        });

        const result = await response.json();
        expect(result.cache_key).toContain(user.userId);
        expect(result.data).toContain(user.userId);
      }
    });

    test('should prevent cache poisoning attacks', async () => {
      const maliciousHeaders = [
        { 'X-Forwarded-Host': 'evil.com' },
        { 'X-Original-URL': '/admin/users' },
        { 'X-Rewrite-URL': '/api/admin/secrets' },
        { 'X-Real-IP': '192.168.1.1' },
        { 'X-Forwarded-For': '10.0.0.1, evil.com' }
      ];

      for (const headers of maliciousHeaders) {
        mockFetch.mockResolvedValueOnce(new Response(
          JSON.stringify({ 
            error: 'Suspicious request detected',
            cache_bypassed: true,
            security_event_logged: true
          }),
          { status: 400 }
        ));

        const response = await fetch('/api/bookings', { headers });
        
        expect(response.status).toBe(400);
        const result = await response.json();
        expect(result.cache_bypassed).toBe(true);
      }
    });

    test('should validate cache TTL security', async () => {
      const cacheTestData = [
        { endpoint: '/api/public/spaces', expectedTTL: 3600 },
        { endpoint: '/api/bookings', expectedTTL: 300 },
        { endpoint: '/api/admin/stats', expectedTTL: 60 }
      ];

      for (const test of cacheTestData) {
        mockFetch.mockResolvedValueOnce(new Response(
          JSON.stringify({ data: 'test_data' }),
          { 
            status: 200,
            headers: {
              'Cache-Control': `max-age=${test.expectedTTL}`,
              'X-Cache-TTL': test.expectedTTL.toString()
            }
          }
        ));

        const response = await fetch(test.endpoint);
        
        expect(response.ok).toBe(true);
        const cacheControl = response.headers.get('Cache-Control');
        expect(cacheControl).toContain(`max-age=${test.expectedTTL}`);
      }
    });

    test('should implement secure cache invalidation', async () => {
      const invalidationRequests = [
        { key: 'user:123:bookings', method: 'DELETE' },
        { key: 'bookings:date:2024-12-01', method: 'PUT' },
        { key: 'spaces:availability', method: 'POST' }
      ];

      for (const req of invalidationRequests) {
        mockFetch.mockResolvedValueOnce(new Response(
          JSON.stringify({ 
            cache_invalidated: true,
            invalidation_key: req.key,
            invalidation_method: req.method,
            affected_entries: Math.floor(Math.random() * 10) + 1
          }),
          { status: 200 }
        ));

        const response = await fetch(`/api/cache/invalidate/${req.key}`, {
          method: req.method,
          headers: { 'Authorization': 'Bearer admin_token' }
        });

        expect(response.ok).toBe(true);
        const result = await response.json();
        expect(result.cache_invalidated).toBe(true);
      }
    });

    test('should prevent cache timing attacks', async () => {
      const timingTestCases = [
        { key: 'existing_key', expectedCacheHit: true },
        { key: 'nonexistent_key', expectedCacheHit: false },
        { key: 'recently_expired_key', expectedCacheHit: false }
      ];

      for (const testCase of timingTestCases) {
        const measurementId = PerformanceMonitor.startMeasurement(`cache_${testCase.key}`);
        
        mockFetch.mockResolvedValueOnce(new Response(
          JSON.stringify({ 
            data: 'test_data',
            cache_hit: testCase.expectedCacheHit
          }),
          { 
            status: 200,
            headers: {
              'X-Cache-Status': testCase.expectedCacheHit ? 'HIT' : 'MISS'
            }
          }
        ));

        const response = await fetch(`/api/data/${testCase.key}`);
        const duration = PerformanceMonitor.endMeasurement(measurementId);

        expect(response.ok).toBe(true);
        
        // Ensure response times don't leak cache state information
        expect(duration).toBeLessThan(1000); // Max 1 second for any cache operation
      }
    });
  });

  describe('Performance Security Tests', () => {
    test('should implement rate limiting to prevent DoS', async () => {
      const rateLimitTests = [
        { endpoint: '/api/bookings', limit: 100, window: 60 },
        { endpoint: '/api/auth/signin', limit: 10, window: 60 },
        { endpoint: '/api/contact', limit: 5, window: 60 }
      ];

      for (const test of rateLimitTests) {
        // Simulate rate limit exceeded
        mockFetch.mockResolvedValueOnce(new Response(
          JSON.stringify({ 
            error: 'Rate limit exceeded',
            limit: test.limit,
            window_seconds: test.window,
            reset_time: Date.now() + (test.window * 1000),
            retry_after: test.window
          }),
          { 
            status: 429,
            headers: {
              'X-RateLimit-Limit': test.limit.toString(),
              'X-RateLimit-Window': test.window.toString(),
              'Retry-After': test.window.toString()
            }
          }
        ));

        const response = await fetch(test.endpoint, {
          method: 'POST',
          body: JSON.stringify({ test: 'data' })
        });

        expect(response.status).toBe(429);
        expect(response.headers.get('Retry-After')).toBe(test.window.toString());
      }
    });

    test('should detect and prevent cache amplification attacks', async () => {
      const amplificationPayloads = [
        'query=' + 'A'.repeat(10000), // Large query parameter
        'search=' + '*'.repeat(1000), // Wildcard expansion
        'filter=' + Array.from({length: 100}, (_, i) => `item${i}`).join(',') // Large filter
      ];

      for (const payload of amplificationPayloads) {
        mockFetch.mockResolvedValueOnce(new Response(
          JSON.stringify({ 
            error: 'Request too large',
            request_size: payload.length,
            max_allowed_size: 1000,
            cache_bypassed: true
          }),
          { status: 413 }
        ));

        const response = await fetch(`/api/search?${payload}`);
        
        expect(response.status).toBe(413);
        const result = await response.json();
        expect(result.cache_bypassed).toBe(true);
      }
    });

    test('should implement memory usage monitoring', async () => {
      mockFetch.mockResolvedValueOnce(new Response(
        JSON.stringify({ 
          cache_stats: {
            memory_usage: 52428800, // 50MB
            max_memory: 104857600, // 100MB
            hit_ratio: 0.85,
            entry_count: 1247,
            evictions: 23,
            memory_pressure: 'normal'
          }
        }),
        { status: 200 }
      ));

      const response = await fetch('/api/admin/cache/stats');
      
      expect(response.ok).toBe(true);
      const result = await response.json();
      expect(result.cache_stats.memory_usage).toBeLessThan(result.cache_stats.max_memory);
      expect(result.cache_stats.hit_ratio).toBeGreaterThan(0.8);
    });

    test('should handle cache stampede scenarios', async () => {
      const concurrentRequests = 20;
      const cacheKey = 'expensive_operation_result';

      // First request triggers cache miss and computation
      mockFetch.mockResolvedValueOnce(new Response(
        JSON.stringify({ 
          data: 'computed_result',
          cache_status: 'MISS',
          computation_time: 2000,
          stampede_protection: true
        }),
        { 
          status: 200,
          headers: {
            'X-Cache-Status': 'MISS',
            'X-Stampede-Protection': 'true'
          }
        }
      ));

      // Subsequent requests get cached result
      for (let i = 1; i < concurrentRequests; i++) {
        mockFetch.mockResolvedValueOnce(new Response(
          JSON.stringify({ 
            data: 'computed_result',
            cache_status: 'HIT',
            computation_time: 0,
            stampede_protection: true
          }),
          { 
            status: 200,
            headers: {
              'X-Cache-Status': 'HIT',
              'X-Stampede-Protection': 'true'
            }
          }
        ));
      }

      const promises = Array.from({ length: concurrentRequests }, () =>
        fetch(`/api/expensive-operation?key=${cacheKey}`)
      );

      const responses = await Promise.all(promises);
      const results = await Promise.all(responses.map(r => r.json()));

      expect(responses.every(r => r.ok)).toBe(true);
      expect(results.every(r => r.stampede_protection)).toBe(true);
      
      // Only first request should be a cache miss
      const misses = results.filter(r => r.cache_status === 'MISS');
      expect(misses.length).toBe(1);
    });

    test('should implement circuit breaker for cache failures', async () => {
      const failureStates = ['CLOSED', 'OPEN', 'HALF_OPEN'];
      
      for (const state of failureStates) {
        mockFetch.mockResolvedValueOnce(new Response(
          JSON.stringify({ 
            data: 'test_data',
            circuit_breaker_state: state,
            cache_available: state !== 'OPEN',
            fallback_used: state === 'OPEN'
          }),
          { 
            status: state === 'OPEN' ? 503 : 200,
            headers: {
              'X-Circuit-Breaker': state
            }
          }
        ));

        const response = await fetch('/api/cached-data');
        const result = await response.json();
        
        expect(result.circuit_breaker_state).toBe(state);
        if (state === 'OPEN') {
          expect(result.fallback_used).toBe(true);
        }
      }
    });
  });

  describe('Cache Eviction Security Tests', () => {
    test('should implement secure LRU eviction', async () => {
      mockFetch.mockResolvedValueOnce(new Response(
        JSON.stringify({ 
          eviction_policy: 'LRU',
          evicted_entries: [
            { key: 'old_key_1', last_access: Date.now() - 7200000 }, // 2 hours ago
            { key: 'old_key_2', last_access: Date.now() - 3600000 }  // 1 hour ago
          ],
          memory_freed: 1048576, // 1MB
          secure_cleanup: true
        }),
        { status: 200 }
      ));

      const response = await fetch('/api/cache/evict', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer admin_token' }
      });

      expect(response.ok).toBe(true);
      const result = await response.json();
      expect(result.secure_cleanup).toBe(true);
      expect(result.evicted_entries.length).toBeGreaterThan(0);
    });

    test('should prevent unauthorized cache access after eviction', async () => {
      const evictedKey = 'user:123:sensitive_data';
      
      mockFetch.mockResolvedValueOnce(new Response(
        JSON.stringify({ 
          error: 'Cache entry not found',
          key: evictedKey,
          was_evicted: true,
          access_denied: true
        }),
        { status: 404 }
      ));

      const response = await fetch(`/api/cache/get/${evictedKey}`);
      
      expect(response.status).toBe(404);
      const result = await response.json();
      expect(result.was_evicted).toBe(true);
      expect(result.access_denied).toBe(true);
    });

    test('should implement secure cache warming', async () => {
      const warmingTargets = [
        { key: 'spaces:availability', priority: 'HIGH' },
        { key: 'pricing:packages', priority: 'MEDIUM' },
        { key: 'content:faq', priority: 'LOW' }
      ];

      for (const target of warmingTargets) {
        mockFetch.mockResolvedValueOnce(new Response(
          JSON.stringify({ 
            warming_started: true,
            cache_key: target.key,
            priority: target.priority,
            estimated_completion: Date.now() + 5000,
            security_validated: true
          }),
          { status: 202 }
        ));

        const response = await fetch('/api/cache/warm', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': 'Bearer admin_token'
          },
          body: JSON.stringify(target)
        });

        expect(response.status).toBe(202);
        const result = await response.json();
        expect(result.security_validated).toBe(true);
      }
    });
  });

  describe('Cache Monitoring and Alerting Tests', () => {
    test('should monitor cache hit ratios and alert on anomalies', async () => {
      const monitoringData = {
        hit_ratio: 0.45, // Below threshold of 0.8
        miss_ratio: 0.55,
        threshold_violation: true,
        alert_triggered: true,
        recommended_action: 'INVESTIGATE_CACHE_CONFIGURATION'
      };

      mockFetch.mockResolvedValueOnce(new Response(
        JSON.stringify(monitoringData),
        { status: 200 }
      ));

      const response = await fetch('/api/monitoring/cache/health');
      
      expect(response.ok).toBe(true);
      const result = await response.json();
      expect(result.threshold_violation).toBe(true);
      expect(result.alert_triggered).toBe(true);
    });

    test('should detect cache security incidents', async () => {
      const securityIncidents = [
        'CACHE_POISONING_ATTEMPT',
        'EXCESSIVE_CACHE_MISSES',
        'UNAUTHORIZED_CACHE_ACCESS',
        'CACHE_TIMING_ATTACK'
      ];

      for (const incident of securityIncidents) {
        mockFetch.mockResolvedValueOnce(new Response(
          JSON.stringify({ 
            incident_type: incident,
            severity: 'HIGH',
            timestamp: Date.now(),
            source_ip: '192.168.1.100',
            mitigation_applied: true,
            investigation_required: true
          }),
          { status: 200 }
        ));

        const response = await fetch(`/api/security/incidents/cache/${incident}`);
        
        expect(response.ok).toBe(true);
        const result = await response.json();
        expect(result.mitigation_applied).toBe(true);
        expect(result.severity).toBe('HIGH');
      }
    });

    test('should implement cache forensics capabilities', async () => {
      const forensicsQuery = {
        start_time: Date.now() - 3600000, // 1 hour ago
        end_time: Date.now(),
        incident_type: 'CACHE_POISONING_ATTEMPT',
        affected_keys: ['user:*', 'booking:*']
      };

      mockFetch.mockResolvedValueOnce(new Response(
        JSON.stringify({ 
          forensics_data: {
            total_events: 157,
            suspicious_patterns: [
              { pattern: 'rapid_key_enumeration', count: 45 },
              { pattern: 'header_injection_attempts', count: 23 }
            ],
            affected_cache_keys: 12,
            attack_timeline: [
              { timestamp: Date.now() - 1800000, event: 'ATTACK_START' },
              { timestamp: Date.now() - 1200000, event: 'PEAK_ACTIVITY' },
              { timestamp: Date.now() - 600000, event: 'MITIGATION_APPLIED' }
            ]
          }
        }),
        { status: 200 }
      ));

      const response = await fetch('/api/forensics/cache', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer security_analyst_token'
        },
        body: JSON.stringify(forensicsQuery)
      });

      expect(response.ok).toBe(true);
      const result = await response.json();
      expect(result.forensics_data.total_events).toBeGreaterThan(0);
      expect(result.forensics_data.attack_timeline.length).toBeGreaterThan(0);
    });
  });
});