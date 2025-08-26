import { z } from 'zod';

/**
 * Install Ticket (JWS) for Marketplace→OS handshake
 * Secure token for authorizing agent installations
 */

// Install ticket payload (JWT claims)
export const InstallTicketPayload = z.object({
  // Standard JWT claims
  iss: z.string(), // Issuer (marketplace service)
  sub: z.string(), // Subject (install request ID)
  aud: z.string(), // Audience (OS service)
  exp: z.number(), // Expiration time (short-lived, e.g., 5 minutes)
  nbf: z.number().optional(), // Not before
  iat: z.number(), // Issued at
  jti: z.string(), // JWT ID (unique ticket ID)
  
  // Install-specific claims
  install_request_id: z.string(),
  agent_id: z.string(),
  agent_version: z.string(),
  listing_id: z.string(),
  tenant_id: z.string(),
  requested_by: z.string(), // user_id
  
  // Authorization context
  marketplace_signature: z.string(), // Marketplace's signature of the request
  pricing_verified: z.boolean(), // Whether pricing/billing is verified
  permissions_granted: z.array(z.string()), // Granted permissions
  
  // Installation parameters
  config: z.record(z.any()).optional(), // Agent configuration
  install_options: z.object({
    auto_start: z.boolean().default(true),
    resource_limits: z.object({
      memory_mb: z.number().optional(),
      cpu_cores: z.number().optional(),
      disk_mb: z.number().optional(),
    }).optional(),
    network_policy: z.enum(['restricted', 'standard', 'full']).default('standard'),
  }).optional(),
  
  // Metadata
  environment: z.enum(['dev', 'staging', 'prod']),
  region: z.string().optional(),
  correlation_id: z.string().optional(),
});

export type InstallTicketPayload = z.infer<typeof InstallTicketPayload>;

// JWS Header for install tickets
export const InstallTicketHeader = z.object({
  alg: z.enum(['RS256', 'ES256', 'PS256']), // Signature algorithm
  typ: z.literal('JWT'),
  kid: z.string(), // Key ID for verification
  
  // Custom headers
  marketplace_id: z.string(), // Identifying the marketplace
  ticket_version: z.string().default('1.0'),
});

export type InstallTicketHeader = z.infer<typeof InstallTicketHeader>;

// JWKS discovery for install tickets
export const InstallTicketJWKSDiscovery = z.object({
  marketplace_id: z.string(),
  jwks_uri: z.string().url(), // Where to fetch public keys
  issuer: z.string().url(), // Token issuer
  
  // Supported algorithms
  supported_algorithms: z.array(z.enum(['RS256', 'ES256', 'PS256'])),
  
  // Key rotation info
  key_rotation_interval_hours: z.number().default(24),
  key_overlap_hours: z.number().default(2),
  
  // Validation endpoints
  ticket_validation_endpoint: z.string().url().optional(),
  revocation_endpoint: z.string().url().optional(),
});

export type InstallTicketJWKSDiscovery = z.infer<typeof InstallTicketJWKSDiscovery>;

// Install ticket validation result
export const InstallTicketValidation = z.object({
  valid: z.boolean(),
  payload: InstallTicketPayload.optional(),
  errors: z.array(z.string()).default([]),
  
  // Validation details
  signature_valid: z.boolean(),
  not_expired: z.boolean(),
  not_before_valid: z.boolean(),
  audience_valid: z.boolean(),
  issuer_valid: z.boolean(),
  
  // Security checks
  marketplace_verified: z.boolean(),
  permissions_valid: z.boolean(),
  pricing_verified: z.boolean(),
  
  // Metadata
  validated_at: z.string().datetime(),
  validator_service: z.string(),
});

export type InstallTicketValidation = z.infer<typeof InstallTicketValidation>;

// Install ticket request (from marketplace to OS)
export const InstallTicketRequest = z.object({
  ticket: z.string(), // JWS token
  
  // Additional context
  client_info: z.object({
    user_agent: z.string().optional(),
    ip_address: z.string().optional(),
    client_id: z.string().optional(),
  }).optional(),
  
  // Request metadata
  request_id: z.string(),
  timestamp: z.string().datetime(),
});

export type InstallTicketRequest = z.infer<typeof InstallTicketRequest>;

// Install ticket response (from OS back to marketplace)
export const InstallTicketResponse = z.object({
  request_id: z.string(),
  status: z.enum(['accepted', 'rejected', 'pending']),
  
  // If accepted
  install_id: z.string().optional(),
  estimated_completion_time: z.string().datetime().optional(),
  
  // If rejected
  rejection_reason: z.string().optional(),
  error_code: z.string().optional(),
  
  // Response metadata
  response_id: z.string(),
  timestamp: z.string().datetime(),
  processing_time_ms: z.number(),
});

export type InstallTicketResponse = z.infer<typeof InstallTicketResponse>;

// Marketplace registry for JWKS discovery
export const MarketplaceRegistry = z.object({
  marketplaces: z.array(z.object({
    id: z.string(),
    name: z.string(),
    base_url: z.string().url(),
    jwks_discovery: InstallTicketJWKSDiscovery,
    trusted: z.boolean(),
    created_at: z.string().datetime(),
    last_verified: z.string().datetime(),
  })),
  
  // Registry metadata
  version: z.string(),
  updated_at: z.string().datetime(),
  next_update: z.string().datetime(),
});

export type MarketplaceRegistry = z.infer<typeof MarketplaceRegistry>;

// Error codes for install ticket validation
export const InstallTicketErrorCodes = {
  INVALID_SIGNATURE: 'INVALID_SIGNATURE',
  EXPIRED_TICKET: 'EXPIRED_TICKET',
  INVALID_AUDIENCE: 'INVALID_AUDIENCE',
  INVALID_ISSUER: 'INVALID_ISSUER',
  MARKETPLACE_NOT_TRUSTED: 'MARKETPLACE_NOT_TRUSTED',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  PRICING_NOT_VERIFIED: 'PRICING_NOT_VERIFIED',
  AGENT_NOT_FOUND: 'AGENT_NOT_FOUND',
  TENANT_SUSPENDED: 'TENANT_SUSPENDED',
  INSTALL_LIMIT_EXCEEDED: 'INSTALL_LIMIT_EXCEEDED',
  JWKS_FETCH_FAILED: 'JWKS_FETCH_FAILED',
  MALFORMED_TICKET: 'MALFORMED_TICKET',
} as const;

export type InstallTicketErrorCode = typeof InstallTicketErrorCodes[keyof typeof InstallTicketErrorCodes];