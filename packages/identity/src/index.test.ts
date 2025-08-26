import { describe, it, expect } from 'vitest';
import { 
  ZablyJWTPayload, 
  validateJWTPayload, 
  hasScope, 
  hasRole,
  AuthErrorCodes 
} from '../src/index';

describe('JWT Claims', () => {
  it('should validate a valid JWT payload', () => {
    const payload = {
      iss: 'https://auth.zably.dev',
      sub: 'user123',
      aud: 'zably-platform',
      exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
      iat: Math.floor(Date.now() / 1000),
      tenant_id: 'tenant123',
      tenant_kind: 'organization' as const,
      roles: ['member' as const],
      scopes: ['agents:read' as const, 'agents:write' as const],
      env: 'dev' as const,
    };

    expect(validateJWTPayload(payload)).toBe(true);
  });

  it('should check scopes correctly', () => {
    const payload: ZablyJWTPayload = {
      iss: 'https://auth.zably.dev',
      sub: 'user123',
      aud: 'zably-platform',
      exp: Math.floor(Date.now() / 1000) + 3600,
      iat: Math.floor(Date.now() / 1000),
      tenant_id: 'tenant123',
      tenant_kind: 'organization',
      roles: ['member'],
      scopes: ['agents:read', 'agents:write'],
      env: 'dev',
    };

    expect(hasScope(payload, 'agents:read')).toBe(true);
    expect(hasScope(payload, 'system:admin')).toBe(false);
  });

  it('should check roles correctly', () => {
    const payload: ZablyJWTPayload = {
      iss: 'https://auth.zably.dev',
      sub: 'user123',
      aud: 'zably-platform',
      exp: Math.floor(Date.now() / 1000) + 3600,
      iat: Math.floor(Date.now() / 1000),
      tenant_id: 'tenant123',
      tenant_kind: 'organization',
      roles: ['admin', 'member'],
      scopes: ['agents:read'],
      env: 'dev',
    };

    expect(hasRole(payload, 'admin')).toBe(true);
    expect(hasRole(payload, 'owner')).toBe(false);
  });

  it('should have correct error codes', () => {
    expect(AuthErrorCodes.INVALID_TOKEN).toBe('INVALID_TOKEN');
    expect(AuthErrorCodes.EXPIRED_TOKEN).toBe('EXPIRED_TOKEN');
  });
});