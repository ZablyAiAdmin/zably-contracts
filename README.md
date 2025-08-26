# Zably Contracts

Shared contracts and schemas for the Zably platform, including JWT claims, AIP manifests, CloudEvents, and event bus specifications.

## Packages

### @zably/contracts-identity
- JWT claims specification with tenant/role model
- JWKS rotation and key management
- Service-to-Service (S2S) authentication with mTLS/JWS
- SPIFFE/SPIRE integration notes
- Error envelope fragments

### @zably/contracts-aip
- AIP (Agent Installation Package) Manifest v1.1
- CloudEvents v1.0 for agent runtime and lifecycle events
- Comprehensive agent metadata and configuration schemas

### @zably/contracts-event-bus
- Event bus topics for inter-service communication
- Install ticket (JWS) for Marketplace→OS handshake
- JWKS discovery and validation

## Installation

```bash
pnpm install
pnpm build
```

## Usage

```typescript
import { Identity, AIP, EventBus } from 'zably-contracts';

// JWT validation
const isValid = Identity.validateJWTPayload(payload);

// AIP manifest validation
const manifestErrors = AIP.getAIPManifestErrors(manifest);

// Event publishing
const event = EventBus.createCloudEvent('zably.run.started', source, data);
```

## Development

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test

# Watch mode
pnpm dev
```

## Contract Specifications

### C0 - Identity & Tenancy Claims + S2S Auth
- Standardized JWT claims for identity and authorization
- Tenant/role model with fine-grained scopes
- mTLS and JWS specifications for S2S communication
- SPIFFE/SPIRE integration guidelines

### C1 - AIP Manifest v1.1 + CloudEvents
- Agent package metadata and configuration schemas
- Runtime requirements and permissions model
- CloudEvents for agent lifecycle and runtime events
- Comprehensive validation and error handling

### C2 - Event Bus Topics & Install Ticket
- Standardized topic naming and message schemas
- Secure install ticket (JWS) for marketplace handshake
- JWKS discovery and key rotation
- Event bus configuration and consumer patterns

## Environment Variables

- `ZABLY_ENV`: Environment (dev, staging, prod)
- `ZABLY_SERVICE`: Service name for context

## License

Private - Zably Platform