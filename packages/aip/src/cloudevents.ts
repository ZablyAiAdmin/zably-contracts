import { z } from 'zod';

/**
 * CloudEvents v1.0 specification for Zably platform events
 * Standardized event format for agent runtime and lifecycle events
 */

// CloudEvents standard attributes
export const CloudEventAttributes = z.object({
  specversion: z.literal('1.0'),
  type: z.string(),
  source: z.string().url(),
  id: z.string(),
  time: z.string().datetime().optional(),
  datacontenttype: z.string().optional(),
  dataschema: z.string().url().optional(),
  subject: z.string().optional(),
});

// CloudEvents extension attributes for Zably
export const ZablyCloudEventExtensions = z.object({
  // Tenant context
  tenantid: z.string().optional(),
  tenantkind: z.enum(['individual', 'organization', 'enterprise', 'system']).optional(),
  
  // Environment context
  environment: z.enum(['dev', 'staging', 'prod']).optional(),
  region: z.string().optional(),
  cluster: z.string().optional(),
  
  // Tracing
  traceid: z.string().optional(),
  spanid: z.string().optional(),
  
  // Security context
  userid: z.string().optional(),
  sessionid: z.string().optional(),
});

// Base CloudEvent structure
export const BaseCloudEvent = CloudEventAttributes.merge(ZablyCloudEventExtensions).extend({
  data: z.any().optional(),
});
export type BaseCloudEvent = z.infer<typeof BaseCloudEvent>;

// Agent runtime events (zably.run.*)
export const AgentRunStartedData = z.object({
  agent_id: z.string(),
  agent_version: z.string(),
  run_id: z.string(),
  config: z.record(z.any()),
  triggered_by: z.enum(['user', 'schedule', 'webhook', 'event']),
  trigger_context: z.record(z.any()).optional(),
});

export const AgentRunCompletedData = z.object({
  agent_id: z.string(),
  agent_version: z.string(),
  run_id: z.string(),
  status: z.enum(['success', 'error', 'timeout', 'cancelled']),
  duration_ms: z.number(),
  result: z.any().optional(),
  error: z.object({
    code: z.string(),
    message: z.string(),
    stack: z.string().optional(),
  }).optional(),
  usage: z.object({
    cpu_time_ms: z.number().optional(),
    memory_peak_mb: z.number().optional(),
    network_bytes: z.number().optional(),
    api_calls: z.number().optional(),
  }).optional(),
});

export const AgentRunProgressData = z.object({
  agent_id: z.string(),
  run_id: z.string(),
  progress_percent: z.number().min(0).max(100),
  current_step: z.string(),
  total_steps: z.number().optional(),
  message: z.string().optional(),
});

// Model call events (zably.model.call)
export const ModelCallData = z.object({
  agent_id: z.string(),
  run_id: z.string(),
  model_provider: z.string(), // openai, anthropic, etc.
  model_name: z.string(),
  call_type: z.enum(['completion', 'chat', 'embedding', 'image', 'audio']),
  input_tokens: z.number().optional(),
  output_tokens: z.number().optional(),
  cost_usd: z.number().optional(),
  duration_ms: z.number(),
  status: z.enum(['success', 'error', 'rate_limited']),
  error: z.string().optional(),
});

// Installation events (zably.install.*)
export const AgentInstallRequestedData = z.object({
  agent_id: z.string(),
  agent_version: z.string(),
  requested_by: z.string(), // user_id
  install_source: z.enum(['marketplace', 'direct', 'import']),
  config: z.record(z.any()).optional(),
});

export const AgentInstallStartedData = z.object({
  agent_id: z.string(),
  agent_version: z.string(),
  install_id: z.string(),
  tenant_id: z.string(),
});

export const AgentInstallCompletedData = z.object({
  agent_id: z.string(),
  agent_version: z.string(),
  install_id: z.string(),
  tenant_id: z.string(),
  status: z.enum(['success', 'failed']),
  duration_ms: z.number(),
  error: z.string().optional(),
});

export const AgentUninstallRequestedData = z.object({
  agent_id: z.string(),
  tenant_id: z.string(),
  requested_by: z.string(), // user_id
  reason: z.string().optional(),
});

// Specific CloudEvent types
export const AgentRunStartedEvent = BaseCloudEvent.extend({
  type: z.literal('zably.run.started'),
  data: AgentRunStartedData,
});

export const AgentRunCompletedEvent = BaseCloudEvent.extend({
  type: z.literal('zably.run.completed'),
  data: AgentRunCompletedData,
});

export const AgentRunProgressEvent = BaseCloudEvent.extend({
  type: z.literal('zably.run.progress'),
  data: AgentRunProgressData,
});

export const ModelCallEvent = BaseCloudEvent.extend({
  type: z.literal('zably.model.call'),
  data: ModelCallData,
});

export const AgentInstallRequestedEvent = BaseCloudEvent.extend({
  type: z.literal('zably.install.requested'),
  data: AgentInstallRequestedData,
});

export const AgentInstallStartedEvent = BaseCloudEvent.extend({
  type: z.literal('zably.install.started'),
  data: AgentInstallStartedData,
});

export const AgentInstallCompletedEvent = BaseCloudEvent.extend({
  type: z.literal('zably.install.completed'),
  data: AgentInstallCompletedData,
});

export const AgentUninstallRequestedEvent = BaseCloudEvent.extend({
  type: z.literal('zably.install.uninstall_requested'),
  data: AgentUninstallRequestedData,
});

// Union type for all Zably CloudEvents
export const ZablyCloudEvent = z.union([
  AgentRunStartedEvent,
  AgentRunCompletedEvent,
  AgentRunProgressEvent,
  ModelCallEvent,
  AgentInstallRequestedEvent,
  AgentInstallStartedEvent,
  AgentInstallCompletedEvent,
  AgentUninstallRequestedEvent,
]);

export type ZablyCloudEvent = z.infer<typeof ZablyCloudEvent>;

// Event type registry
export const ZablyEventTypes = {
  // Runtime events
  AGENT_RUN_STARTED: 'zably.run.started',
  AGENT_RUN_COMPLETED: 'zably.run.completed',
  AGENT_RUN_PROGRESS: 'zably.run.progress',
  
  // Model events
  MODEL_CALL: 'zably.model.call',
  
  // Installation events
  AGENT_INSTALL_REQUESTED: 'zably.install.requested',
  AGENT_INSTALL_STARTED: 'zably.install.started',
  AGENT_INSTALL_COMPLETED: 'zably.install.completed',
  AGENT_UNINSTALL_REQUESTED: 'zably.install.uninstall_requested',
} as const;

export type ZablyEventType = typeof ZablyEventTypes[keyof typeof ZablyEventTypes];

// Utility functions
export function createCloudEvent<T extends ZablyCloudEvent>(
  type: T['type'],
  source: string,
  data: T['data'],
  extensions?: Partial<z.infer<typeof ZablyCloudEventExtensions>>
): T {
  return {
    specversion: '1.0',
    type,
    source,
    id: generateUUID(),
    time: new Date().toISOString(),
    data,
    ...extensions,
  } as T;
}

export function validateCloudEvent(event: unknown): event is ZablyCloudEvent {
  try {
    ZablyCloudEvent.parse(event);
    return true;
  } catch {
    return false;
  }
}

export function getEventValidationErrors(event: unknown): string[] {
  try {
    ZablyCloudEvent.parse(event);
    return [];
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
    }
    return ['Unknown validation error'];
  }
}

// Simple UUID generator for Node.js environments without crypto.randomUUID
function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback UUID v4 generator
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}