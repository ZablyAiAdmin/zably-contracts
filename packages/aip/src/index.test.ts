import { describe, it, expect } from 'vitest';
import { 
  AIPManifest, 
  validateAIPManifest, 
  getAIPManifestErrors,
  ZablyCloudEvent,
  validateCloudEvent,
  createCloudEvent,
  ZablyEventTypes
} from '../src/index';

describe('AIP Manifest', () => {
  it('should validate a valid AIP manifest', () => {
    const manifest = {
      manifest_version: '1.1' as const,
      id: 'test-agent',
      name: 'Test Agent',
      version: '1.0.0',
      description: 'A test agent for validation',
      category: 'utility' as const,
      author: {
        name: 'Test Author',
        email: 'test@example.com',
      },
      license: {
        type: 'MIT',
      },
      main: 'index.js',
    };

    expect(validateAIPManifest(manifest)).toBe(true);
    expect(getAIPManifestErrors(manifest)).toHaveLength(0);
  });

  it('should return errors for invalid manifest', () => {
    const manifest = {
      manifest_version: '1.1',
      id: 'INVALID-ID', // Should be lowercase
      name: '',
      version: 'invalid-version',
    };

    expect(validateAIPManifest(manifest)).toBe(false);
    const errors = getAIPManifestErrors(manifest);
    expect(errors.length).toBeGreaterThan(0);
  });
});

describe('CloudEvents', () => {
  it('should create a valid CloudEvent', () => {
    const event = createCloudEvent(
      ZablyEventTypes.AGENT_RUN_STARTED,
      'https://os.zably.dev',
      {
        agent_id: 'test-agent',
        agent_version: '1.0.0',
        run_id: 'run123',
        config: {},
        triggered_by: 'user' as const,
      }
    );

    expect(validateCloudEvent(event)).toBe(true);
    expect(event.type).toBe('zably.run.started');
    expect(event.specversion).toBe('1.0');
  });

  it('should validate CloudEvent structure', () => {
    const validEvent = {
      specversion: '1.0',
      type: 'zably.run.completed',
      source: 'https://os.zably.dev',
      id: 'event123',
      data: {
        agent_id: 'test-agent',
        agent_version: '1.0.0',
        run_id: 'run123',
        status: 'success' as const,
        duration_ms: 1000,
      },
    };

    expect(validateCloudEvent(validEvent)).toBe(true);
  });
});