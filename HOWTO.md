# HOWTO - Zably Contracts

## Overview

The Zably Contracts package provides shared schemas and specifications for the Zably platform, including JWT claims, AIP manifests, CloudEvents, and event bus specifications.

## Installation & Setup

### Prerequisites
- Node.js >= 18.0.0
- pnpm >= 8.0.0

### Installation
```bash
# Clone and setup
git clone <repository-url>
cd zably-contracts
pnpm install
```

### Environment Variables
Copy `.env.template` to `.env.local` and configure:

```bash
# Required
ZABLY_ENV=dev|staging|prod
ZABLY_SERVICE=contracts

# JWKS Configuration
JWKS_ISSUER=https://auth.zably.dev
JWKS_URI=https://auth.zably.dev/.well-known/jwks.json

# Event Bus
EVENT_BUS_BROKERS=localhost:9092
EVENT_BUS_SECURITY_PROTOCOL=PLAINTEXT
EVENT_BUS_CONSUMER_GROUP=zably-contracts

# S2S Authentication
S2S_CLIENT_ID=zably-contracts
S2S_CLIENT_CERT_PATH=/path/to/client.crt
S2S_CLIENT_KEY_PATH=/path/to/client.key
S2S_CA_CERT_PATH=/path/to/ca.crt
```

## Development Commands

### Build & Development
```bash
# Install dependencies
pnpm -w install

# Build all packages
pnpm -w build

# Watch mode for development
pnpm -w dev

# Type generation
pnpm -w types:gen
```

### Testing
```bash
# Run all tests
pnpm -w test

# Unit tests only
pnpm -w test:unit

# Integration tests
pnpm -w test:integration

# E2E tests
pnpm -w test:e2e

# Coverage (≥80% required)
vitest --coverage
```

### Code Quality
```bash
# Linting
pnpm -w lint

# Formatting
pnpm -w format
```

## Package Structure

### @zably/contracts-identity
JWT claims, tenant/role model, and S2S authentication contracts.

**Key Exports:**
- `ZablyJWTPayload` - Standard JWT payload with Zably claims
- `S2SJWTPayload` - Service-to-service JWT payload
- `Role`, `Scope`, `TenantKind` - Authorization enums
- `validateJWTPayload()` - JWT validation utility
- `hasScope()`, `hasRole()` - Permission checking utilities

**Routes/Payloads:**
- JWT validation: `validateJWTPayload(payload: unknown): boolean`
- Scope checking: `hasScope(payload, scope): boolean`
- Role checking: `hasRole(payload, role): boolean`

### @zably/contracts-aip
AIP Manifest v1.1 and CloudEvents schemas for agent packages.

**Key Exports:**
- `AIPManifest` - Agent package manifest schema
- `ZablyCloudEvent` - CloudEvents for agent lifecycle
- `AgentCategory`, `AgentPermission` - Agent metadata enums
- `validateAIPManifest()` - Manifest validation
- `createCloudEvent()` - CloudEvent creation utility

**Routes/Payloads:**
- Manifest validation: `validateAIPManifest(manifest: unknown): boolean`
- Event creation: `createCloudEvent(type, source, data, extensions?)`
- Event validation: `validateCloudEvent(event: unknown): boolean`

### @zably/contracts-event-bus
Event bus topics and install ticket (JWS) for Marketplace→OS handshake.

**Key Exports:**
- `ZablyTopics` - Event topic constants
- `InstallTicketPayload` - Install ticket JWT claims
- `ZablyEventMessage` - Event message schemas
- Topic configurations and JWKS discovery

**Routes/Payloads:**
- Event topics: `ZablyTopics.MP_LISTING_PUBLISHED`, `ZablyTopics.OS_INSTALL_CREATED`, etc.
- Install ticket validation: JWT-based marketplace→OS handshake
- Event bus configuration: Kafka/message broker settings

## Usage Examples

### JWT Validation
```typescript
import { Identity } from 'zably-contracts';

const payload = {
  iss: 'https://auth.zably.dev',
  sub: 'user123',
  tenant_id: 'tenant123',
  tenant_kind: 'organization',
  roles: ['member'],
  scopes: ['agents:read', 'agents:write'],
  env: 'dev',
  // ... other claims
};

if (Identity.validateJWTPayload(payload)) {
  if (Identity.hasScope(payload, 'agents:write')) {
    // User can write agents
  }
}
```

### AIP Manifest Validation
```typescript
import { AIP } from 'zably-contracts';

const manifest = {
  manifest_version: '1.1',
  id: 'my-agent',
  name: 'My Agent',
  version: '1.0.0',
  description: 'A sample agent',
  category: 'utility',
  author: { name: 'Developer' },
  license: { type: 'MIT' },
  main: 'index.js',
};

const errors = AIP.getAIPManifestErrors(manifest);
if (errors.length === 0) {
  // Manifest is valid
}
```

### CloudEvents
```typescript
import { AIP } from 'zably-contracts';

const event = AIP.createCloudEvent(
  'zably.run.started',
  'https://os.zably.dev',
  {
    agent_id: 'my-agent',
    agent_version: '1.0.0',
    run_id: 'run123',
    config: {},
    triggered_by: 'user',
  }
);
```

### Event Bus Topics
```typescript
import { EventBus } from 'zably-contracts';

// Publishing to topics
const topic = EventBus.ZablyTopics.MP_LISTING_PUBLISHED;
const message = {
  event_id: 'uuid',
  event_type: topic,
  timestamp: new Date().toISOString(),
  source_service: 'marketplace',
  data: {
    listing_id: 'listing123',
    agent_id: 'agent123',
    // ... other data
  },
};
```

## Deployment

### Docker Build
```bash
# Build Docker image
docker build -t zably/contracts:dev .

# Run container
docker run --rm -p 8080:8080 zably/contracts:dev

# Health check
curl -fsS http://localhost:8080/health
```

### Kubernetes
```bash
# Apply manifests (if applicable)
kubectl apply -n zably-dev -f deploy/k8s/contracts/

# Check deployment
kubectl get pods -n zably-dev
```

## Contract Specifications

### C0 - Identity & Tenancy Claims + S2S Auth
- **JWT Claims**: Standardized payload with tenant_id, tenant_kind, roles[], scopes[], env
- **JWKS Rotation**: Automatic key rotation with configurable intervals
- **S2S Auth**: mTLS and JWS for service-to-service communication
- **SPIFFE/SPIRE**: Integration notes for workload identity

### C1 - AIP Manifest v1.1 + CloudEvents
- **AIP Manifest**: Comprehensive agent package metadata schema
- **CloudEvents**: Runtime events (zably.run.*, zably.model.call, zably.install.*)
- **Validation**: Zod-based schema validation with detailed error reporting

### C2 - Event Bus Topics & Install Ticket
- **Topics**: Standardized naming (mp.listing.published, os.install.created, os.run.completed, os.usage.rollup)
- **Install Ticket**: JWS-based marketplace→OS handshake with JWKS discovery
- **Event Bus**: Kafka configuration and consumer patterns

## Troubleshooting

### Common Issues

1. **TypeScript Compilation Errors**
   - Ensure all packages have `composite: true` in tsconfig.json
   - Run `pnpm -w build` to build project references

2. **Test Failures**
   - Check environment variables in `.env.local`
   - Ensure all dependencies are installed: `pnpm -w install`

3. **JWKS Validation Issues**
   - Verify JWKS_URI is accessible
   - Check key rotation configuration
   - Validate JWT payload structure

4. **Event Bus Connection**
   - Verify EVENT_BUS_BROKERS configuration
   - Check security protocol settings
   - Ensure consumer group permissions

### Support
For issues and questions, refer to the main Zably platform documentation or contact the development team.