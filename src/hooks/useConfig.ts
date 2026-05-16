import { useEffect, useState } from 'react';
import { type AppConfig, loadConfig } from '../lib/config';

export function useConfig() {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConfig()
      .then(setConfig)
      .finally(() => setLoading(false));
  }, []);

  return { config, loading };
}
