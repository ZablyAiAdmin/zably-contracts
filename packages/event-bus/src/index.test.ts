import { describe, it, expect } from 'vitest';
import { 
  ZablyTopics,
  InstallTicketPayload,
  InstallTicketErrorCodes,
  ZablyEventMessage
} from '../src/index';

describe('Event Bus Topics', () => {
  it('should have correct topic names', () => {
    expect(ZablyTopics.MP_LISTING_PUBLISHED).toBe('mp.listing.published');
    expect(ZablyTopics.OS_INSTALL_CREATED).toBe('os.install.created');
    expect(ZablyTopics.OS_RUN_COMPLETED).toBe('os.run.completed');
    expect(ZablyTopics.OS_USAGE_ROLLUP).toBe('os.usage.rollup');
  });

  it('should validate event messages', () => {
    const message = {
      event_id: '123e4567-e89b-12d3-a456-426614174000',
      event_type: 'mp.listing.published',
      timestamp: new Date().toISOString(),
      source_service: 'marketplace',
      version: '1.0',
      data: {
        listing_id: 'listing123',
        agent_id: 'agent123',
        agent_version: '1.0.0',
        publisher_id: 'publisher123',
        category: 'utility',
        pricing_model: 'free' as const,
        published_at: new Date().toISOString(),
      },
    };

    expect(() => ZablyEventMessage.parse(message)).not.toThrow();
  });
});

describe('Install Ticket', () => {
  it('should validate install ticket payload', () => {
    const payload: InstallTicketPayload = {
      iss: 'https://marketplace.zably.dev',
      sub: 'install-req-123',
      aud: 'https://os.zably.dev',
      exp: Math.floor(Date.now() / 1000) + 300, // 5 minutes
      iat: Math.floor(Date.now() / 1000),
      jti: 'ticket-123',
      install_request_id: 'install-req-123',
      agent_id: 'agent123',
      agent_version: '1.0.0',
      listing_id: 'listing123',
      tenant_id: 'tenant123',
      requested_by: 'user123',
      marketplace_signature: 'signature123',
      pricing_verified: true,
      permissions_granted: ['agents:read', 'agents:write'],
      environment: 'dev',
    };

    expect(() => InstallTicketPayload.parse(payload)).not.toThrow();
  });

  it('should have correct error codes', () => {
    expect(InstallTicketErrorCodes.INVALID_SIGNATURE).toBe('INVALID_SIGNATURE');
    expect(InstallTicketErrorCodes.EXPIRED_TICKET).toBe('EXPIRED_TICKET');
    expect(InstallTicketErrorCodes.MARKETPLACE_NOT_TRUSTED).toBe('MARKETPLACE_NOT_TRUSTED');
  });
});