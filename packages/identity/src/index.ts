// Identity & Tenancy Claims + S2S Auth Contracts
export * from './jwt-claims';
export * from './jwks';
export * from './s2s-auth';

// Utility functions for common operations
import { ZablyJWTPayload, S2SJWTPayload, Scope, Role } from './jwt-claims';

/**
 * Check if a JWT payload has the required scope
 */
export function hasScope(payload: ZablyJWTPayload | S2SJWTPayload, requiredScope: Scope): boolean {
  return payload.scopes.includes(requiredScope);
}

/**
 * Check if a JWT payload has any of the required scopes
 */
export function hasAnyScope(payload: ZablyJWTPayload | S2SJWTPayload, requiredScopes: Scope[]): boolean {
  return requiredScopes.some(scope => payload.scopes.includes(scope));
}

/**
 * Check if a JWT payload has all required scopes
 */
export function hasAllScopes(payload: ZablyJWTPayload | S2SJWTPayload, requiredScopes: Scope[]): boolean {
  return requiredScopes.every(scope => payload.scopes.includes(scope));
}

/**
 * Check if a user JWT payload has the required role
 */
export function hasRole(payload: ZablyJWTPayload, requiredRole: Role): boolean {
  return payload.roles.includes(requiredRole);
}

/**
 * Check if a user JWT payload has any of the required roles
 */
export function hasAnyRole(payload: ZablyJWTPayload, requiredRoles: Role[]): boolean {
  return requiredRoles.some(role => payload.roles.includes(role));
}

/**
 * Check if a JWT token is expired
 */
export function isTokenExpired(payload: ZablyJWTPayload | S2SJWTPayload): boolean {
  const now = Math.floor(Date.now() / 1000);
  return payload.exp <= now;
}

/**
 * Check if a JWT token is not yet valid (nbf check)
 */
export function isTokenNotYetValid(payload: ZablyJWTPayload | S2SJWTPayload): boolean {
  if (!payload.nbf) return false;
  const now = Math.floor(Date.now() / 1000);
  return payload.nbf > now;
}

/**
 * Validate JWT payload structure and timing
 */
export function validateJWTPayload(payload: unknown): payload is ZablyJWTPayload {
  try {
    const parsed = ZablyJWTPayload.parse(payload);
    return !isTokenExpired(parsed) && !isTokenNotYetValid(parsed);
  } catch {
    return false;
  }
}

/**
 * Validate S2S JWT payload structure and timing
 */
export function validateS2SJWTPayload(payload: unknown): payload is S2SJWTPayload {
  try {
    const parsed = S2SJWTPayload.parse(payload);
    return !isTokenExpired(parsed) && !isTokenNotYetValid(parsed);
  } catch {
    return false;
  }
}