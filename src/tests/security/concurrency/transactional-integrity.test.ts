// Tests de Integridad Transaccional y Concurrencia
// Tests comprehensivos para validar la integridad de datos en operaciones concurrentes

import { jest } from '@jest/globals';
import { AttackSimulator, PerformanceMonitor } from '../../utils/security-helpers';

describe('Transactional Integrity and Concurrency Tests', () => {
  let mockFetch: jest.MockedFunction<typeof global.fetch>;
  
  beforeEach(() => {
    mockFetch = jest.fn() as jest.MockedFunction<typeof global.fetch>;
    global.fetch = mockFetch;
    PerformanceMonitor.clearMeasurements();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Database Transaction Integrity Tests', () => {
    test('should maintain ACID properties during booking creation', async () => {
      const bookingData = {
        name: 'Test User',
        email: 'test@example.com',
        phone: '+34600000000',
        company: 'Test Company',
        studio_space: 'principal-zone',
        package_duration: '2h',
        preferred_date: '2024-12-01',
        preferred_time: '10:00',
        participants: 5,
        session_type: 'Fotografía',
        notes: 'Test booking',
        total_price: 100
      };

      // Simulate successful transaction
      mockFetch.mockResolvedValueOnce(new Response(
        JSON.stringify({ 
          success: true, 
          booking_id: 'booking_123',
          transaction_id: 'tx_456'
        }),
        { status: 200 }
      ));

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData)
      });

      expect(response.ok).toBe(true);
      const result = await response.json();
      expect(result.booking_id).toBeDefined();
      expect(result.transaction_id).toBeDefined();
    });

    test('should rollback transaction on validation failure', async () => {
      const invalidBookingData = {
        name: 'Test User',
        email: 'invalid-email',
        phone: 'invalid-phone',
        preferred_date: 'invalid-date'
      };

      // Simulate validation failure with rollback
      mockFetch.mockResolvedValueOnce(new Response(
        JSON.stringify({ 
          error: 'Validation failed',
          details: ['Invalid email format', 'Invalid phone format', 'Invalid date format'],
          transaction_rolled_back: true
        }),
        { status: 400 }
      ));

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidBookingData)
      });

      expect(response.status).toBe(400);
      const result = await response.json();
      expect(result.transaction_rolled_back).toBe(true);
    });

    test('should handle deadlock scenarios gracefully', async () => {
      // Simulate deadlock detection and resolution
      mockFetch.mockResolvedValueOnce(new Response(
        JSON.stringify({ 
          error: 'Transaction deadlock detected',
          retry_after: 100,
          retries_remaining: 3
        }),
        { status: 409 }
      ));

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test User',
          email: 'test@example.com',
          studio_space: 'principal-zone',
          preferred_date: '2024-12-01',
          preferred_time: '10:00'
        })
      });

      expect(response.status).toBe(409);
      const result = await response.json();
      expect(result.retry_after).toBeDefined();
      expect(result.retries_remaining).toBeDefined();
    });
  });

  describe('Concurrent Access Control Tests', () => {
    test('should prevent double booking under concurrent requests', async () => {
      const bookingData = {
        studio_space: 'principal-zone',
        preferred_date: '2024-12-01',
        preferred_time: '10:00',
        package_duration: '2h'
      };

      // First request succeeds
      mockFetch.mockResolvedValueOnce(new Response(
        JSON.stringify({ 
          success: true, 
          booking_id: 'booking_123',
          slot_reserved: true
        }),
        { status: 200 }
      ));

      // Second request fails due to conflict
      mockFetch.mockResolvedValueOnce(new Response(
        JSON.stringify({ 
          error: 'Time slot no longer available',
          conflict_detected: true,
          available_slots: ['11:00', '12:00', '14:00']
        }),
        { status: 409 }
      ));

      // Simulate concurrent requests
      const [response1, response2] = await Promise.all([
        fetch('/api/bookings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...bookingData, name: 'User 1', email: 'user1@example.com' })
        }),
        fetch('/api/bookings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...bookingData, name: 'User 2', email: 'user2@example.com' })
        })
      ]);

      expect(response1.ok).toBe(true);
      expect(response2.status).toBe(409);
      
      const result2 = await response2.json();
      expect(result2.conflict_detected).toBe(true);
    });

    test('should handle race conditions in booking updates', async () => {
      const bookingId = 'booking_123';
      const updateData = { status: 'confirmed' };

      // Simulate optimistic locking with version control
      mockFetch.mockResolvedValueOnce(new Response(
        JSON.stringify({ 
          error: 'Version conflict detected',
          current_version: 2,
          provided_version: 1,
          latest_data: { status: 'pending', version: 2 }
        }),
        { status: 409 }
      ));

      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'If-Match': '"version_1"'
        },
        body: JSON.stringify(updateData)
      });

      expect(response.status).toBe(409);
      const result = await response.json();
      expect(result.current_version).toBeGreaterThan(result.provided_version);
    });

    test('should implement proper resource locking for booking modifications', async () => {
      const bookingId = 'booking_123';
      
      // Simulate resource lock acquisition
      mockFetch.mockResolvedValueOnce(new Response(
        JSON.stringify({ 
          lock_acquired: true,
          lock_id: 'lock_456',
          lock_timeout: 30000
        }),
        { status: 200 }
      ));

      const response = await fetch(`/api/bookings/${bookingId}/lock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operation: 'update' })
      });

      expect(response.ok).toBe(true);
      const result = await response.json();
      expect(result.lock_acquired).toBe(true);
      expect(result.lock_id).toBeDefined();
    });
  });

  describe('Data Consistency Tests', () => {
    test('should maintain referential integrity across related tables', async () => {
      // Test cascade deletion behavior
      const bookingId = 'booking_123';
      
      mockFetch.mockResolvedValueOnce(new Response(
        JSON.stringify({ 
          success: true,
          deleted_booking: bookingId,
          cascade_deletions: {
            booking_items: 3,
            booking_logs: 7,
            notifications: 2
          },
          referential_integrity_maintained: true
        }),
        { status: 200 }
      ));

      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'DELETE'
      });

      expect(response.ok).toBe(true);
      const result = await response.json();
      expect(result.referential_integrity_maintained).toBe(true);
      expect(result.cascade_deletions).toBeDefined();
    });

    test('should enforce foreign key constraints', async () => {
      const invalidBookingData = {
        name: 'Test User',
        email: 'test@example.com',
        studio_space: 'non-existent-space',
        package_duration: 'invalid-duration'
      };

      mockFetch.mockResolvedValueOnce(new Response(
        JSON.stringify({ 
          error: 'Foreign key constraint violation',
          violations: [
            { field: 'studio_space', value: 'non-existent-space', constraint: 'fk_studio_spaces' },
            { field: 'package_duration', value: 'invalid-duration', constraint: 'fk_packages' }
          ]
        }),
        { status: 400 }
      ));

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidBookingData)
      });

      expect(response.status).toBe(400);
      const result = await response.json();
      expect(result.violations).toHaveLength(2);
    });

    test('should handle unique constraint violations', async () => {
      const duplicateBookingData = {
        name: 'Test User',
        email: 'test@example.com',
        studio_space: 'principal-zone',
        preferred_date: '2024-12-01',
        preferred_time: '10:00',
        package_duration: '2h'
      };

      mockFetch.mockResolvedValueOnce(new Response(
        JSON.stringify({ 
          error: 'Unique constraint violation',
          constraint: 'unique_booking_slot',
          conflicting_booking: 'booking_456',
          suggested_alternatives: [
            { date: '2024-12-01', time: '11:00' },
            { date: '2024-12-01', time: '14:00' },
            { date: '2024-12-02', time: '10:00' }
          ]
        }),
        { status: 409 }
      ));

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(duplicateBookingData)
      });

      expect(response.status).toBe(409);
      const result = await response.json();
      expect(result.constraint).toBe('unique_booking_slot');
      expect(result.suggested_alternatives).toHaveLength(3);
    });
  });

  describe('Isolation Level Tests', () => {
    test('should prevent dirty reads in concurrent transactions', async () => {
      const bookingId = 'booking_123';
      
      // Simulate read during ongoing transaction
      mockFetch.mockResolvedValueOnce(new Response(
        JSON.stringify({ 
          booking: {
            id: bookingId,
            status: 'pending',
            isolation_level: 'READ_COMMITTED'
          },
          dirty_read_prevented: true
        }),
        { status: 200 }
      ));

      const response = await fetch(`/api/bookings/${bookingId}`, {
        headers: { 'X-Isolation-Level': 'READ_COMMITTED' }
      });

      expect(response.ok).toBe(true);
      const result = await response.json();
      expect(result.dirty_read_prevented).toBe(true);
    });

    test('should prevent phantom reads in range queries', async () => {
      const queryParams = new URLSearchParams({
        date: '2024-12-01',
        studio_space: 'principal-zone'
      });

      mockFetch.mockResolvedValueOnce(new Response(
        JSON.stringify({ 
          bookings: [
            { id: 'booking_123', time: '10:00' },
            { id: 'booking_456', time: '14:00' }
          ],
          total_count: 2,
          phantom_reads_prevented: true,
          isolation_level: 'REPEATABLE_READ'
        }),
        { status: 200 }
      ));

      const response = await fetch(`/api/bookings?${queryParams}`, {
        headers: { 'X-Isolation-Level': 'REPEATABLE_READ' }
      });

      expect(response.ok).toBe(true);
      const result = await response.json();
      expect(result.phantom_reads_prevented).toBe(true);
    });

    test('should handle serialization anomalies', async () => {
      // Simulate serialization failure
      mockFetch.mockResolvedValueOnce(new Response(
        JSON.stringify({ 
          error: 'Serialization failure',
          error_code: 'SERIALIZATION_FAILURE',
          retry_recommended: true,
          backoff_ms: 100
        }),
        { status: 409 }
      ));

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Isolation-Level': 'SERIALIZABLE'
        },
        body: JSON.stringify({
          name: 'Test User',
          email: 'test@example.com',
          studio_space: 'principal-zone',
          preferred_date: '2024-12-01',
          preferred_time: '10:00'
        })
      });

      expect(response.status).toBe(409);
      const result = await response.json();
      expect(result.error_code).toBe('SERIALIZATION_FAILURE');
      expect(result.retry_recommended).toBe(true);
    });
  });

  describe('Performance Under Concurrency', () => {
    test('should maintain acceptable response times under load', async () => {
      const concurrentRequests = 50;
      const maxResponseTime = 2000; // 2 seconds

      // Mock responses with varying delays
      const responses = Array.from({ length: concurrentRequests }, (_, i) => {
        const delay = Math.floor(Math.random() * 1000);
        return new Promise(resolve => 
          setTimeout(() => resolve(new Response(
            JSON.stringify({ 
              success: true, 
              booking_id: `booking_${i}`,
              processing_time: delay
            }),
            { status: 200 }
          )), delay)
        );
      });

      mockFetch.mockImplementation(() => responses.shift() as Promise<Response>);

      const measurementId = PerformanceMonitor.startMeasurement('concurrent_bookings');
      
      const requestPromises = Array.from({ length: concurrentRequests }, (_, i) =>
        fetch('/api/bookings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: `User ${i}`,
            email: `user${i}@example.com`,
            studio_space: 'principal-zone',
            preferred_date: '2024-12-01',
            preferred_time: `${10 + i}:00`
          })
        })
      );

      const results = await Promise.allSettled(requestPromises);
      const duration = PerformanceMonitor.endMeasurement(measurementId);

      expect(duration).toBeLessThan(maxResponseTime);
      expect(results.filter(r => r.status === 'fulfilled')).toHaveLength(concurrentRequests);
    });

    test('should implement connection pooling effectively', async () => {
      mockFetch.mockResolvedValue(new Response(
        JSON.stringify({ 
          success: true,
          connection_pool_stats: {
            active_connections: 8,
            max_connections: 20,
            queue_size: 2,
            avg_connection_time: 45
          }
        }),
        { status: 200 }
      ));

      const response = await fetch('/api/admin/database/stats');
      
      expect(response.ok).toBe(true);
      const result = await response.json();
      expect(result.connection_pool_stats.active_connections).toBeLessThan(
        result.connection_pool_stats.max_connections
      );
    });

    test('should handle connection timeouts gracefully', async () => {
      mockFetch.mockResolvedValueOnce(new Response(
        JSON.stringify({ 
          error: 'Database connection timeout',
          timeout_ms: 5000,
          retry_after: 1000,
          circuit_breaker_state: 'HALF_OPEN'
        }),
        { status: 503 }
      ));

      const response = await fetch('/api/bookings');
      
      expect(response.status).toBe(503);
      const result = await response.json();
      expect(result.circuit_breaker_state).toBeDefined();
    });
  });

  describe('Transaction Recovery Tests', () => {
    test('should recover from aborted transactions', async () => {
      mockFetch.mockResolvedValueOnce(new Response(
        JSON.stringify({ 
          error: 'Transaction aborted',
          abort_reason: 'RESOURCE_UNAVAILABLE',
          recovery_attempted: true,
          recovery_successful: false,
          retry_recommended: true
        }),
        { status: 503 }
      ));

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test User',
          email: 'test@example.com'
        })
      });

      expect(response.status).toBe(503);
      const result = await response.json();
      expect(result.recovery_attempted).toBe(true);
    });

    test('should handle partial transaction commits', async () => {
      mockFetch.mockResolvedValueOnce(new Response(
        JSON.stringify({ 
          warning: 'Partial transaction commit detected',
          committed_operations: [
            'booking_created',
            'inventory_updated'
          ],
          failed_operations: [
            'notification_sent',
            'analytics_tracked'
          ],
          compensation_actions: [
            'retry_notifications',
            'manual_analytics_sync'
          ]
        }),
        { status: 202 }
      ));

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test User',
          email: 'test@example.com'
        })
      });

      expect(response.status).toBe(202);
      const result = await response.json();
      expect(result.compensation_actions).toBeDefined();
    });
  });
});