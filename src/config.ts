export interface AppConfig {
  deploymentId: string;
  appName: string;
  orgName: string;
  brandColour: string;
  logoUrl: string | null;
  systemPrompt: string;
  capabilities: string[];
}

const DEFAULTS: AppConfig = {
  deploymentId: 'local',
  appName: 'Answer',
  orgName: 'Your Organisation',
  brandColour: '#6366f1',
  logoUrl: null,
  systemPrompt: 'You are a knowledge base assistant that answers questions accurately.',
  capabilities: ['knowledge-base'],
};

export async function loadConfig(): Promise<AppConfig> {
  const id = import.meta.env.VITE_DEPLOYMENT_ID;
  if (!id) return DEFAULTS;
  try {
    const res = await fetch(`https://app.jobgraph.com/api/apps/${id}/config`);
    if (!res.ok) return DEFAULTS;
    return { ...DEFAULTS, ...await res.json() };
  } catch {
    return DEFAULTS;
  }
}
