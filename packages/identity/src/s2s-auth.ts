import { z } from 'zod';

/**
 * Service-to-Service (S2S) Authentication
 * mTLS and JWS specifications for secure service communication
 */

// mTLS Configuration
export const MTLSConfig = z.object({
  enabled: z.boolean().default(true),
  client_cert_path: z.string(),
  client_key_path: z.string(),
  ca_cert_path: z.string(),
  verify_peer: z.boolean().default(true),
  verify_hostname: z.boolean().default(true),
  cipher_suites: z.array(z.string()).optional(),
  min_tls_version: z.enum(['1.2', '1.3']).default('1.2'),
});
export type MTLSConfig = z.infer<typeof MTLSConfig>;

// JWS (JSON Web Signature) for S2S tokens
export const JWSHeader = z.object({
  alg: z.enum(['RS256', 'ES256', 'PS256']),
  typ: z.literal('JWT'),
  kid: z.string(),
  crit: z.array(z.string()).optional(), // Critical header parameters
});
export type JWSHeader = z.infer<typeof JWSHeader>;

// S2S Authentication Request
export const S2SAuthRequest = z.object({
  grant_type: z.literal('client_credentials'),
  client_id: z.string(),
  client_assertion_type: z.literal('urn:ietf:params:oauth:client-assertion-type:jwt-bearer'),
  client_assertion: z.string(), // JWS token
  scope: z.string().optional(), // Space-separated scopes
});
export type S2SAuthRequest = z.infer<typeof S2SAuthRequest>;

// S2S Authentication Response
export const S2SAuthResponse = z.object({
  access_token: z.string(),
  token_type: z.literal('Bearer'),
  expires_in: z.number(),
  scope: z.string().optional(),
  issued_token_type: z.literal('urn:ietf:params:oauth:token-type:access_token').optional(),
});
export type S2SAuthResponse = z.infer<typeof S2SAuthResponse>;

// SPIFFE/SPIRE Integration Notes
export const SPIFFEConfig = z.object({
  enabled: z.boolean().default(false),
  spiffe_id: z.string().optional(), // spiffe://trust-domain/workload-identifier
  trust_domain: z.string().optional(),
  workload_api_socket: z.string().optional(), // Unix socket path
  svid_file_path: z.string().optional(), // X.509 SVID file
  key_file_path: z.string().optional(), // Private key file
  bundle_file_path: z.string().optional(), // Trust bundle file
  refresh_interval_seconds: z.number().default(300), // 5 minutes
});
export type SPIFFEConfig = z.infer<typeof SPIFFEConfig>;

// Service Identity
export const ServiceIdentity = z.object({
  service_name: z.string(),
  service_version: z.string(),
  environment: z.enum(['dev', 'staging', 'prod']),
  namespace: z.string().optional(),
  cluster: z.string().optional(),
  
  // Authentication methods
  mtls: MTLSConfig.optional(),
  spiffe: SPIFFEConfig.optional(),
  
  // Service metadata
  endpoints: z.array(z.string().url()),
  health_check_path: z.string().default('/health'),
  metrics_path: z.string().default('/metrics'),
});
export type ServiceIdentity = z.infer<typeof ServiceIdentity>;

// S2S Request Context
export const S2SRequestContext = z.object({
  source_service: z.string(),
  target_service: z.string(),
  request_id: z.string(),
  trace_id: z.string().optional(),
  span_id: z.string().optional(),
  timestamp: z.string().datetime(),
  
  // Security context
  client_cert_fingerprint: z.string().optional(),
  spiffe_id: z.string().optional(),
  jwt_claims: z.record(z.any()).optional(),
});
export type S2SRequestContext = z.infer<typeof S2SRequestContext>;