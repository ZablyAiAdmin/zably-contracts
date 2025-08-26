import { z } from 'zod';

/**
 * AIP (Agent Installation Package) Manifest v1.1
 * Shared schemas for agent packages and metadata
 */

// Semantic version schema
export const SemanticVersion = z.string().regex(
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/,
  'Must be a valid semantic version'
);
export type SemanticVersion = z.infer<typeof SemanticVersion>;

// Agent categories
export const AgentCategory = z.enum([
  'productivity',
  'development',
  'data-analysis',
  'communication',
  'automation',
  'security',
  'monitoring',
  'integration',
  'ai-ml',
  'business',
  'utility',
  'entertainment'
]);
export type AgentCategory = z.infer<typeof AgentCategory>;

// Runtime requirements
export const RuntimeRequirements = z.object({
  node_version: z.string().optional(), // e.g., ">=18.0.0"
  python_version: z.string().optional(), // e.g., ">=3.9"
  memory_mb: z.number().min(1).optional(),
  cpu_cores: z.number().min(0.1).optional(),
  disk_mb: z.number().min(1).optional(),
  gpu_required: z.boolean().default(false),
  network_access: z.boolean().default(true),
  
  // Platform requirements
  os: z.array(z.enum(['linux', 'darwin', 'win32'])).optional(),
  arch: z.array(z.enum(['x64', 'arm64', 'arm'])).optional(),
});
export type RuntimeRequirements = z.infer<typeof RuntimeRequirements>;

// Agent permissions
export const AgentPermission = z.enum([
  'filesystem:read',
  'filesystem:write',
  'network:http',
  'network:websocket',
  'system:exec',
  'system:env',
  'database:read',
  'database:write',
  'secrets:read',
  'secrets:write',
  'notifications:send',
  'calendar:read',
  'calendar:write',
  'email:send',
  'email:read'
]);
export type AgentPermission = z.infer<typeof AgentPermission>;

// Agent configuration schema - using explicit typing to avoid circular reference issues
export const AgentConfigSchema: z.ZodType<any> = z.lazy(() => z.object({
  type: z.enum(['string', 'number', 'boolean', 'array', 'object']),
  required: z.boolean().default(false),
  default: z.any().optional(),
  description: z.string(),
  enum: z.array(z.any()).optional(), // For enumerated values
  min: z.number().optional(), // For numbers
  max: z.number().optional(), // For numbers
  pattern: z.string().optional(), // For string validation
  items: AgentConfigSchema.optional(), // For arrays
  properties: z.record(AgentConfigSchema).optional(), // For objects
}));
export type AgentConfigSchema = z.infer<typeof AgentConfigSchema>;

// Agent endpoint definition
export const AgentEndpoint = z.object({
  path: z.string(),
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']),
  description: z.string(),
  parameters: z.record(AgentConfigSchema).optional(),
  response_schema: AgentConfigSchema.optional(),
  auth_required: z.boolean().default(true),
  rate_limit: z.object({
    requests_per_minute: z.number().min(1),
    burst_limit: z.number().min(1).optional(),
  }).optional(),
});
export type AgentEndpoint = z.infer<typeof AgentEndpoint>;

// Agent author information
export const AgentAuthor = z.object({
  name: z.string(),
  email: z.string().email().optional(),
  url: z.string().url().optional(),
  organization: z.string().optional(),
});
export type AgentAuthor = z.infer<typeof AgentAuthor>;

// Agent license
export const AgentLicense = z.object({
  type: z.string(), // SPDX license identifier
  url: z.string().url().optional(),
  file: z.string().optional(), // Path to license file
});
export type AgentLicense = z.infer<typeof AgentLicense>;

// Agent repository information
export const AgentRepository = z.object({
  type: z.enum(['git', 'svn', 'mercurial']),
  url: z.string().url(),
  directory: z.string().optional(),
});
export type AgentRepository = z.infer<typeof AgentRepository>;

// Main AIP Manifest schema
export const AIPManifest = z.object({
  // Manifest metadata
  manifest_version: z.literal('1.1'),
  schema_version: SemanticVersion.default('1.1.0'),
  
  // Agent identification
  id: z.string().regex(/^[a-z0-9-]+$/, 'Must be lowercase alphanumeric with hyphens'),
  name: z.string().min(1).max(100),
  version: SemanticVersion,
  description: z.string().min(10).max(500),
  
  // Categorization
  category: AgentCategory,
  tags: z.array(z.string()).max(10).default([]),
  
  // Author and licensing
  author: AgentAuthor,
  license: AgentLicense,
  repository: AgentRepository.optional(),
  
  // Technical specifications
  runtime: RuntimeRequirements.default({}),
  permissions: z.array(AgentPermission).default([]),
  
  // Agent interface
  main: z.string(), // Entry point file
  endpoints: z.array(AgentEndpoint).default([]),
  config_schema: z.record(AgentConfigSchema).default({}),
  
  // Dependencies
  dependencies: z.record(z.string()).default({}), // npm-style dependencies
  peer_dependencies: z.record(z.string()).default({}),
  
  // Marketplace metadata
  icon: z.string().optional(), // Path to icon file
  screenshots: z.array(z.string()).max(5).default([]),
  readme: z.string().optional(), // Path to README file
  changelog: z.string().optional(), // Path to CHANGELOG file
  
  // Pricing and billing
  pricing: z.object({
    model: z.enum(['free', 'one-time', 'subscription', 'usage-based']),
    price: z.number().min(0).optional(),
    currency: z.string().length(3).optional(), // ISO 4217
    billing_period: z.enum(['monthly', 'yearly']).optional(),
    usage_tiers: z.array(z.object({
      limit: z.number(),
      price_per_unit: z.number(),
    })).optional(),
  }).optional(),
  
  // Installation and lifecycle
  install_script: z.string().optional(),
  uninstall_script: z.string().optional(),
  health_check: z.object({
    endpoint: z.string(),
    interval_seconds: z.number().min(10).default(60),
    timeout_seconds: z.number().min(1).default(10),
  }).optional(),
  
  // Metadata
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
  keywords: z.array(z.string()).max(20).default([]),
  homepage: z.string().url().optional(),
  bugs: z.string().url().optional(),
});

export type AIPManifest = z.infer<typeof AIPManifest>;

// Validation utilities
export function validateAIPManifest(manifest: unknown): manifest is AIPManifest {
  try {
    AIPManifest.parse(manifest);
    return true;
  } catch {
    return false;
  }
}

export function getAIPManifestErrors(manifest: unknown): string[] {
  try {
    AIPManifest.parse(manifest);
    return [];
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
    }
    return ['Unknown validation error'];
  }
}