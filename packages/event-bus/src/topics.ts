import { z } from 'zod';

/**
 * Event Bus Topics for Zably Platform
 * Standardized topic names and message schemas for inter-service communication
 */

// Topic naming convention: {service}.{entity}.{action}
export const ZablyTopics = {
  // Marketplace events
  MP_LISTING_PUBLISHED: 'mp.listing.published',
  MP_LISTING_UPDATED: 'mp.listing.updated',
  MP_LISTING_UNPUBLISHED: 'mp.listing.unpublished',
  MP_INSTALL_REQUESTED: 'mp.install.requested',
  MP_INSTALL_CANCELLED: 'mp.install.cancelled',
  
  // Operating System events
  OS_INSTALL_CREATED: 'os.install.created',
  OS_INSTALL_STARTED: 'os.install.started',
  OS_INSTALL_COMPLETED: 'os.install.completed',
  OS_INSTALL_FAILED: 'os.install.failed',
  OS_RUN_STARTED: 'os.run.started',
  OS_RUN_COMPLETED: 'os.run.completed',
  OS_RUN_FAILED: 'os.run.failed',
  OS_USAGE_ROLLUP: 'os.usage.rollup',
  
  // Billing events
  BILLING_USAGE_RECORDED: 'billing.usage.recorded',
  BILLING_INVOICE_GENERATED: 'billing.invoice.generated',
  BILLING_PAYMENT_PROCESSED: 'billing.payment.processed',
  
  // User events
  USER_CREATED: 'user.created',
  USER_UPDATED: 'user.updated',
  USER_DELETED: 'user.deleted',
  
  // Tenant events
  TENANT_CREATED: 'tenant.created',
  TENANT_UPDATED: 'tenant.updated',
  TENANT_SUSPENDED: 'tenant.suspended',
} as const;

export type ZablyTopic = typeof ZablyTopics[keyof typeof ZablyTopics];

// Base message structure for all events
export const BaseEventMessage = z.object({
  event_id: z.string().uuid(),
  event_type: z.string(),
  timestamp: z.string().datetime(),
  source_service: z.string(),
  correlation_id: z.string().optional(),
  tenant_id: z.string().optional(),
  user_id: z.string().optional(),
  version: z.string().default('1.0'),
});

// Marketplace listing events
export const ListingPublishedMessage = BaseEventMessage.extend({
  event_type: z.literal(ZablyTopics.MP_LISTING_PUBLISHED),
  data: z.object({
    listing_id: z.string(),
    agent_id: z.string(),
    agent_version: z.string(),
    publisher_id: z.string(),
    category: z.string(),
    pricing_model: z.enum(['free', 'one-time', 'subscription', 'usage-based']),
    published_at: z.string().datetime(),
  }),
});

export const ListingUpdatedMessage = BaseEventMessage.extend({
  event_type: z.literal(ZablyTopics.MP_LISTING_UPDATED),
  data: z.object({
    listing_id: z.string(),
    agent_id: z.string(),
    agent_version: z.string(),
    changes: z.array(z.string()),
    updated_at: z.string().datetime(),
  }),
});

// Install request events
export const InstallRequestedMessage = BaseEventMessage.extend({
  event_type: z.literal(ZablyTopics.MP_INSTALL_REQUESTED),
  data: z.object({
    install_request_id: z.string(),
    listing_id: z.string(),
    agent_id: z.string(),
    agent_version: z.string(),
    tenant_id: z.string(),
    requested_by: z.string(), // user_id
    config: z.record(z.any()).optional(),
    install_ticket: z.string(), // JWS token
  }),
});

// OS install events
export const InstallCreatedMessage = BaseEventMessage.extend({
  event_type: z.literal(ZablyTopics.OS_INSTALL_CREATED),
  data: z.object({
    install_id: z.string(),
    install_request_id: z.string(),
    agent_id: z.string(),
    agent_version: z.string(),
    tenant_id: z.string(),
    status: z.literal('created'),
    created_at: z.string().datetime(),
  }),
});

export const InstallCompletedMessage = BaseEventMessage.extend({
  event_type: z.literal(ZablyTopics.OS_INSTALL_COMPLETED),
  data: z.object({
    install_id: z.string(),
    agent_id: z.string(),
    agent_version: z.string(),
    tenant_id: z.string(),
    status: z.enum(['success', 'failed']),
    duration_ms: z.number(),
    error: z.string().optional(),
    completed_at: z.string().datetime(),
  }),
});

// Runtime events
export const RunCompletedMessage = BaseEventMessage.extend({
  event_type: z.literal(ZablyTopics.OS_RUN_COMPLETED),
  data: z.object({
    run_id: z.string(),
    agent_id: z.string(),
    tenant_id: z.string(),
    status: z.enum(['success', 'error', 'timeout', 'cancelled']),
    duration_ms: z.number(),
    usage: z.object({
      cpu_time_ms: z.number(),
      memory_peak_mb: z.number(),
      api_calls: z.number(),
      tokens_used: z.number().optional(),
    }),
    completed_at: z.string().datetime(),
  }),
});

// Usage rollup events
export const UsageRollupMessage = BaseEventMessage.extend({
  event_type: z.literal(ZablyTopics.OS_USAGE_ROLLUP),
  data: z.object({
    tenant_id: z.string(),
    agent_id: z.string(),
    period_start: z.string().datetime(),
    period_end: z.string().datetime(),
    usage_summary: z.object({
      total_runs: z.number(),
      total_duration_ms: z.number(),
      total_cpu_time_ms: z.number(),
      total_api_calls: z.number(),
      total_tokens_used: z.number().optional(),
      estimated_cost_usd: z.number().optional(),
    }),
  }),
});

// Union type for all event messages
export const ZablyEventMessage = z.union([
  ListingPublishedMessage,
  ListingUpdatedMessage,
  InstallRequestedMessage,
  InstallCreatedMessage,
  InstallCompletedMessage,
  RunCompletedMessage,
  UsageRollupMessage,
]);

export type ZablyEventMessage = z.infer<typeof ZablyEventMessage>;

// Topic configuration
export const TopicConfig = z.object({
  name: z.string(),
  partitions: z.number().min(1).default(1),
  replication_factor: z.number().min(1).default(3),
  retention_ms: z.number().min(1).default(7 * 24 * 60 * 60 * 1000), // 7 days
  cleanup_policy: z.enum(['delete', 'compact']).default('delete'),
  
  // Message settings
  max_message_bytes: z.number().default(1048576), // 1MB
  compression_type: z.enum(['none', 'gzip', 'snappy', 'lz4', 'zstd']).default('snappy'),
  
  // Consumer settings
  consumer_groups: z.array(z.string()).default([]),
  dead_letter_topic: z.string().optional(),
});

export type TopicConfig = z.infer<typeof TopicConfig>;

// Event bus configuration
export const EventBusConfig = z.object({
  broker_urls: z.array(z.string().url()),
  security_protocol: z.enum(['PLAINTEXT', 'SSL', 'SASL_PLAINTEXT', 'SASL_SSL']).default('SASL_SSL'),
  sasl_mechanism: z.enum(['PLAIN', 'SCRAM-SHA-256', 'SCRAM-SHA-512']).optional(),
  ssl_ca_location: z.string().optional(),
  ssl_certificate_location: z.string().optional(),
  ssl_key_location: z.string().optional(),
  
  // Producer settings
  producer_config: z.object({
    acks: z.enum(['0', '1', 'all']).default('all'),
    retries: z.number().default(3),
    batch_size: z.number().default(16384),
    linger_ms: z.number().default(5),
    compression_type: z.enum(['none', 'gzip', 'snappy', 'lz4', 'zstd']).default('snappy'),
  }).default({}),
  
  // Consumer settings
  consumer_config: z.object({
    group_id: z.string(),
    auto_offset_reset: z.enum(['earliest', 'latest']).default('latest'),
    enable_auto_commit: z.boolean().default(true),
    auto_commit_interval_ms: z.number().default(5000),
    max_poll_records: z.number().default(500),
  }),
});

export type EventBusConfig = z.infer<typeof EventBusConfig>;