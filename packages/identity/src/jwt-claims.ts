import { z } from 'zod';

/**
 * Zably JWT Claims Specification
 * Standardized claims for identity, tenancy, and authorization
 */

// Environment types
export const ZablyEnvironment = z.enum(['dev', 'staging', 'prod']);
export type ZablyEnvironment = z.infer<typeof ZablyEnvironment>;

// Tenant kinds
export const TenantKind = z.enum([
  'individual',
  'organization',
  'enterprise',
  'system'
]);
export type TenantKind = z.infer<typeof TenantKind>;

// Role definitions
export const Role = z.enum([
  'admin',
  'owner',
  'member',
  'viewer',
  'agent',
  'system'
]);
export type Role = z.infer<typeof Role>;

// Scope definitions for fine-grained permissions
export const Scope = z.enum([
  // Agent management
  'agents:read',
  'agents:write',
  'agents:execute',
  'agents:install',
  'agents:uninstall',
  
  // Marketplace
  'marketplace:read',
  'marketplace:publish',
  'marketplace:manage',
  
  // Billing & usage
  'billing:read',
  'billing:write',
  'usage:read',
  'usage:write',
  
  // System operations
  'system:admin',
  'system:monitor',
  'system:debug',
  
  // Data operations
  'data:read',
  'data:write',
  'data:delete'
]);
export type Scope = z.infer<typeof Scope>;

// Standard JWT claims
export const StandardClaims = z.object({
  iss: z.string(), // Issuer
  sub: z.string(), // Subject (user ID)
  aud: z.union([z.string(), z.array(z.string())]), // Audience
  exp: z.number(), // Expiration time
  nbf: z.number().optional(), // Not before
  iat: z.number(), // Issued at
  jti: z.string().optional(), // JWT ID
});

// Zably-specific claims
export const ZablyClaims = z.object({
  tenant_id: z.string(),
  tenant_kind: TenantKind,
  roles: z.array(Role),
  scopes: z.array(Scope),
  env: ZablyEnvironment,
  
  // Optional context
  session_id: z.string().optional(),
  device_id: z.string().optional(),
  ip_address: z.string().optional(),
  user_agent: z.string().optional(),
});

// Complete JWT payload
export const ZablyJWTPayload = StandardClaims.merge(ZablyClaims);
export type ZablyJWTPayload = z.infer<typeof ZablyJWTPayload>;

// Service-to-Service (S2S) specific claims
export const S2SClaims = z.object({
  service_name: z.string(),
  service_version: z.string(),
  client_id: z.string(),
  grant_type: z.literal('client_credentials'),
});

export const S2SJWTPayload = StandardClaims.merge(S2SClaims).merge(
  ZablyClaims.pick({ scopes: true, env: true })
);
export type S2SJWTPayload = z.infer<typeof S2SJWTPayload>;

// JWT Header
export const JWTHeader = z.object({
  alg: z.enum(['RS256', 'ES256', 'HS256']),
  typ: z.literal('JWT'),
  kid: z.string(), // Key ID for JWKS
});
export type JWTHeader = z.infer<typeof JWTHeader>;

// Error envelope fragment for consistent error responses
export const ErrorEnvelope = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.record(z.any()).optional(),
    trace_id: z.string().optional(),
    timestamp: z.string().datetime(),
  }),
  request_id: z.string().optional(),
});
export type ErrorEnvelope = z.infer<typeof ErrorEnvelope>;

// Common error codes for identity/auth
export const AuthErrorCodes = {
  INVALID_TOKEN: 'INVALID_TOKEN',
  EXPIRED_TOKEN: 'EXPIRED_TOKEN',
  INSUFFICIENT_SCOPE: 'INSUFFICIENT_SCOPE',
  INVALID_TENANT: 'INVALID_TENANT',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  JWKS_ERROR: 'JWKS_ERROR',
  S2S_AUTH_FAILED: 'S2S_AUTH_FAILED',
} as const;

export type AuthErrorCode = typeof AuthErrorCodes[keyof typeof AuthErrorCodes];