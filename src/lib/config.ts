export interface AppConfig {
  deploymentId: string;
  appName: string;
  orgName: string;
  brandColour: string;
  logoUrl: string | null;
  systemPrompt: string;
  capabilities: string[];
  isConfigured: boolean;
  status?: 'ACTIVE' | 'PILOT' | 'EXPIRED' | 'PAUSED';
  pilotEndsAt?: string | null;
}

const DEFAULTS: AppConfig = {
  deploymentId: 'local',
  appName: 'Answer',
  orgName: 'Your Organisation',
  brandColour: '#6366f1',
  logoUrl: null,
  systemPrompt: 'You are a knowledge base assistant that answers questions accurately.',
  capabilities: ['knowledge-base'],
  isConfigured: false,
  status: 'ACTIVE',
};

let cached: AppConfig | null = null;

/** Reset the config cache — used by tests. */
export function _resetCache() { cached = null; }

export async function loadConfig(): Promise<AppConfig> {
  if (cached) return cached;
  // Cloudflare Worker injects config at the edge — use it directly
  const injected = (window as unknown as { __JOBGRAPH_CONFIG__?: Partial<AppConfig> }).__JOBGRAPH_CONFIG__;
  if (injected?.deploymentId) {
    cached = { ...DEFAULTS, ...injected, isConfigured: true };
    return cached;
  }
  // Local dev fallback: fetch via VITE_DEPLOYMENT_ID
  const id = import.meta.env.VITE_DEPLOYMENT_ID;
  if (!id) {
    cached = DEFAULTS;
    return DEFAULTS;
  }
  try {
    const res = await fetch(`https://app.jobgraph.com/api/apps/${id}/config`);
    if (!res.ok) {
      const fallback = { ...DEFAULTS, deploymentId: id };
      cached = fallback;
      return fallback;
    }
    const result: AppConfig = { ...DEFAULTS, ...(await res.json()), deploymentId: id, isConfigured: true };
    cached = result;
    return result;
  } catch {
    const fallback = { ...DEFAULTS, deploymentId: id };
    cached = fallback;
    return fallback;
  }
}
