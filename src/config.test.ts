import { describe, it, expect, vi, beforeEach } from 'vitest'
import { loadConfig } from './config'

describe('loadConfig', () => {
  beforeEach(() => { vi.restoreAllMocks(); vi.unstubAllEnvs() })

  it('returns defaults when VITE_DEPLOYMENT_ID is not set', async () => {
    vi.stubEnv('VITE_DEPLOYMENT_ID', '')
    const config = await loadConfig()
    expect(config.deploymentId).toBe('local')
    expect(config.appName).toBeTruthy()
    expect(config.isConfigured).toBe(false)
  })

  it('fetches config from API when VITE_DEPLOYMENT_ID is set', async () => {
    vi.stubEnv('VITE_DEPLOYMENT_ID', 'test-id')
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ orgName: 'Test Org', brandColour: '#ff0000' }),
    }) as any
    const config = await loadConfig()
    expect(config.orgName).toBe('Test Org')
    expect(config.brandColour).toBe('#ff0000')
    expect(config.isConfigured).toBe(true)
  })

  it('falls back to defaults when API call fails', async () => {
    vi.stubEnv('VITE_DEPLOYMENT_ID', 'test-id')
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error')) as any
    const config = await loadConfig()
    expect(config.deploymentId).toBe('local')
    expect(config.isConfigured).toBe(false)
  })

  it('falls back to defaults when API returns non-200', async () => {
    vi.stubEnv('VITE_DEPLOYMENT_ID', 'test-id')
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 404 }) as any
    const config = await loadConfig()
    expect(config.deploymentId).toBe('local')
    expect(config.isConfigured).toBe(false)
  })
})
