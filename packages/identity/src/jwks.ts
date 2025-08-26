import { z } from 'zod';

/**
 * JWKS (JSON Web Key Set) Configuration and Rotation
 */

// JWK (JSON Web Key) structure
export const JWK = z.object({
  kty: z.enum(['RSA', 'EC', 'oct']), // Key type
  use: z.enum(['sig', 'enc']).optional(), // Key use
  key_ops: z.array(z.enum(['sign', 'verify', 'encrypt', 'decrypt'])).optional(),
  alg: z.enum(['RS256', 'ES256', 'HS256']).optional(), // Algorithm
  kid: z.string(), // Key ID
  
  // RSA specific
  n: z.string().optional(), // Modulus
  e: z.string().optional(), // Exponent
  
  // EC specific
  crv: z.enum(['P-256', 'P-384', 'P-521']).optional(), // Curve
  x: z.string().optional(), // X coordinate
  y: z.string().optional(), // Y coordinate
  
  // Symmetric key
  k: z.string().optional(), // Key value
  
  // Metadata
  x5c: z.array(z.string()).optional(), // X.509 certificate chain
  x5t: z.string().optional(), // X.509 certificate SHA-1 thumbprint
  'x5t#S256': z.string().optional(), // X.509 certificate SHA-256 thumbprint
});
export type JWK = z.infer<typeof JWK>;

// JWKS structure
export const JWKS = z.object({
  keys: z.array(JWK),
});
export type JWKS = z.infer<typeof JWKS>;

// JWKS rotation configuration
export const JWKSRotationConfig = z.object({
  rotation_interval_hours: z.number().min(1).max(8760), // 1 hour to 1 year
  overlap_period_hours: z.number().min(1), // Grace period for old keys
  key_size: z.number().default(2048), // For RSA keys
  algorithm: z.enum(['RS256', 'ES256']).default('RS256'),
  auto_rotate: z.boolean().default(true),
});
export type JWKSRotationConfig = z.infer<typeof JWKSRotationConfig>;

// JWKS endpoints configuration
export const JWKSEndpoints = z.object({
  jwks_uri: z.string().url(), // Public JWKS endpoint
  issuer: z.string().url(), // Token issuer
  token_endpoint: z.string().url().optional(), // Token endpoint for S2S
  revocation_endpoint: z.string().url().optional(), // Token revocation
});
export type JWKSEndpoints = z.infer<typeof JWKSEndpoints>;

// Key metadata for tracking
export const KeyMetadata = z.object({
  kid: z.string(),
  created_at: z.string().datetime(),
  expires_at: z.string().datetime(),
  algorithm: z.string(),
  status: z.enum(['active', 'rotating', 'deprecated', 'revoked']),
  usage_count: z.number().default(0),
  last_used: z.string().datetime().optional(),
});
export type KeyMetadata = z.infer<typeof KeyMetadata>;