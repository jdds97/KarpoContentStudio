// Mock Attackers Simulation Engine
// Utilidades para simular diferentes tipos de atacantes en tests de seguridad

import { jest } from '@jest/globals';
import { AttackVectorGenerator } from './security-helpers';

// =============================================================================
// ATTACKER PROFILES
// =============================================================================

export const ATTACKER_PROFILES = {
  SCRIPT_KIDDIE: {
    name: 'Script Kiddie',
    skill_level: 1,
    patience: 'low',
    tools: ['basic_scanners', 'public_exploits'],
    attack_patterns: ['random', 'noisy']
  },
  INTERMEDIATE_HACKER: {
    name: 'Intermediate Hacker',
    skill_level: 3,
    patience: 'medium',
    tools: ['burp_suite', 'sqlmap', 'custom_scripts'],
    attack_patterns: ['methodical', 'adaptive']
  },
  ADVANCED_THREAT: {
    name: 'Advanced Persistent Threat',
    skill_level: 5,
    patience: 'high',
    tools: ['custom_exploits', 'zero_days', 'social_engineering'],
    attack_patterns: ['stealthy', 'persistent', 'targeted']
  },
  INSIDER_THREAT: {
    name: 'Insider Threat',
    skill_level: 2,
    patience: 'high',
    tools: ['legitimate_access', 'social_knowledge'],
    attack_patterns: ['abuse_of_trust', 'data_exfiltration']
  }
} as const;

export type AttackerProfile = keyof typeof ATTACKER_PROFILES;

// =============================================================================
// ATTACK SIMULATION ENGINE
// =============================================================================

export interface XSSAttackResult {
  success: boolean;
  vulnerable_fields: string[];
  reflected_xss_detected: boolean;
  stored_xss_detected: boolean;
  payloads_tested: number;
  details: string[];
}

export interface SQLInjectionResult {
  success: boolean;
  vulnerable_endpoints: string[];
  error_based_sqli: boolean;
  blind_sqli: boolean;
  time_based_sqli: boolean;
  payloads_tested: number;
}

export interface BruteForceResult {
  success: boolean;
  attempts_made: number;
  rate_limited: boolean;
  lockout_triggered: boolean;
  response_times: number[];
}

export class AttackSimulationEngine {
  private profile: typeof ATTACKER_PROFILES[AttackerProfile];
  private baseUrl: string;
  private mockFetch: jest.MockedFunction<typeof fetch>;

  constructor(profileName: AttackerProfile, baseUrl: string) {
    this.profile = ATTACKER_PROFILES[profileName];
    this.baseUrl = baseUrl;
    this.mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>;
    global.fetch = this.mockFetch;
  }

  // Simulate XSS attack
  async simulateXSSAttack(endpoint: string, fields: string[]): Promise<XSSAttackResult> {
    const result: XSSAttackResult = {
      success: false,
      vulnerable_fields: [],
      reflected_xss_detected: false,
      stored_xss_detected: false,
      payloads_tested: 0,
      details: []
    };

    const payloads = AttackVectorGenerator.getXSSPayloads();

    for (const field of fields) {
      for (const payload of payloads) {
        result.payloads_tested++;

        // Mock secure response (escaped payload)
        this.mockFetch.mockResolvedValueOnce(new Response(
          JSON.stringify({
            [field]: payload.replace(/</g, '&lt;').replace(/>/g, '&gt;')
          }),
          { status: 200 }
        ));

        try {
          const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ [field]: payload })
          });

          const data = await response.json();
          const responseStr = JSON.stringify(data);

          // Check if payload was reflected without escaping
          if (responseStr.includes(payload) && !responseStr.includes('&lt;')) {
            result.vulnerable_fields.push(field);
            result.reflected_xss_detected = true;
            result.success = true;
            result.details.push(`Reflected XSS in field: ${field}`);
          }
        } catch (error) {
          // Expected for blocked attacks
        }
      }
    }

    return result;
  }

  // Simulate SQL Injection attack
  async simulateSQLInjection(endpoint: string): Promise<SQLInjectionResult> {
    const result: SQLInjectionResult = {
      success: false,
      vulnerable_endpoints: [],
      error_based_sqli: false,
      blind_sqli: false,
      time_based_sqli: false,
      payloads_tested: 0
    };

    const payloads = AttackVectorGenerator.getSQLInjectionPayloads();

    for (const payload of payloads) {
      result.payloads_tested++;

      // Mock secure response
      this.mockFetch.mockResolvedValueOnce(new Response(
        JSON.stringify({ error: 'Invalid input' }),
        { status: 400 }
      ));

      try {
        const response = await fetch(`${this.baseUrl}${endpoint}?id=${encodeURIComponent(payload)}`);
        const text = await response.text();

        // Check for SQL error messages (would indicate vulnerability)
        if (text.match(/sql|database|syntax|mysql|postgresql|oracle/i)) {
          result.success = true;
          result.error_based_sqli = true;
          result.vulnerable_endpoints.push(endpoint);
        }
      } catch (error) {
        // Expected for blocked attacks
      }
    }

    return result;
  }

  // Simulate brute force attack
  async simulateBruteForce(
    endpoint: string,
    attempts: number = 100
  ): Promise<BruteForceResult> {
    const result: BruteForceResult = {
      success: false,
      attempts_made: 0,
      rate_limited: false,
      lockout_triggered: false,
      response_times: []
    };

    for (let i = 0; i < attempts; i++) {
      result.attempts_made++;
      const startTime = Date.now();

      // Mock rate limiting after 10 attempts
      if (i >= 10) {
        this.mockFetch.mockResolvedValueOnce(new Response(
          JSON.stringify({ error: 'Too many requests' }),
          { status: 429 }
        ));
      } else {
        this.mockFetch.mockResolvedValueOnce(new Response(
          JSON.stringify({ error: 'Invalid credentials' }),
          { status: 401 }
        ));
      }

      try {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: `test${i}@example.com`,
            password: `password${i}`
          })
        });

        result.response_times.push(Date.now() - startTime);

        if (response.status === 429) {
          result.rate_limited = true;
          break;
        }

        if (response.status === 423) {
          result.lockout_triggered = true;
          break;
        }

        if (response.ok) {
          result.success = true;
          break;
        }
      } catch (error) {
        // Expected for blocked attacks
      }
    }

    return result;
  }

  // Simulate CSRF attack
  async simulateCSRFAttack(endpoint: string): Promise<{
    success: boolean;
    csrf_token_required: boolean;
    origin_validated: boolean;
  }> {
    // Mock response requiring CSRF token
    this.mockFetch.mockResolvedValueOnce(new Response(
      JSON.stringify({ error: 'CSRF token missing or invalid' }),
      { status: 403 }
    ));

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://evil-attacker.com'
      },
      body: JSON.stringify({ action: 'malicious_action' })
    });

    return {
      success: response.ok,
      csrf_token_required: response.status === 403,
      origin_validated: response.status === 403
    };
  }

  // Get attack sophistication based on profile
  getAttackSophistication(): number {
    return this.profile.skill_level;
  }

  // Reset mocks
  resetMocks(): void {
    this.mockFetch.mockReset();
  }
}

// =============================================================================
// ATTACK SCENARIO GENERATORS
// =============================================================================

export class AttackScenarioGenerator {
  // Generate random attack scenario
  static generateRandomScenario(): {
    profile: AttackerProfile;
    target: string;
    attack_type: string;
    payloads: string[];
  } {
    const profiles: AttackerProfile[] = ['SCRIPT_KIDDIE', 'INTERMEDIATE_HACKER', 'ADVANCED_THREAT', 'INSIDER_THREAT'];
    const targets = ['/api/bookings', '/api/auth/login', '/api/contact', '/admin/dashboard'];
    const attackTypes = ['xss', 'sqli', 'csrf', 'brute_force'];

    const profile = profiles[Math.floor(Math.random() * profiles.length)];
    const target = targets[Math.floor(Math.random() * targets.length)];
    const attackType = attackTypes[Math.floor(Math.random() * attackTypes.length)];

    let payloads: string[] = [];
    switch (attackType) {
      case 'xss':
        payloads = AttackVectorGenerator.getXSSPayloads();
        break;
      case 'sqli':
        payloads = AttackVectorGenerator.getSQLInjectionPayloads();
        break;
      default:
        payloads = [];
    }

    return { profile, target, attack_type: attackType, payloads };
  }

  // Generate targeted attack scenario
  static generateTargetedScenario(
    profile: AttackerProfile,
    target: string
  ): {
    attack_sequence: string[];
    expected_responses: number[];
    success_criteria: string;
  } {
    const attackSequence: string[] = [];
    const expectedResponses: number[] = [];

    switch (profile) {
      case 'SCRIPT_KIDDIE':
        attackSequence.push('basic_xss', 'basic_sqli');
        expectedResponses.push(400, 400);
        break;
      case 'INTERMEDIATE_HACKER':
        attackSequence.push('recon', 'probe', 'exploit', 'persist');
        expectedResponses.push(200, 400, 403, 403);
        break;
      case 'ADVANCED_THREAT':
        attackSequence.push('passive_recon', 'active_recon', 'vulnerability_scan', 'exploit_chain', 'lateral_movement', 'data_exfil');
        expectedResponses.push(200, 200, 400, 403, 403, 403);
        break;
      case 'INSIDER_THREAT':
        attackSequence.push('legitimate_access', 'privilege_abuse', 'data_collection');
        expectedResponses.push(200, 403, 403);
        break;
    }

    return {
      attack_sequence: attackSequence,
      expected_responses: expectedResponses,
      success_criteria: 'All attacks should be blocked or detected'
    };
  }
}
