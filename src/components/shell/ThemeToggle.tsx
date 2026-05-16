import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
const CYCLE: Array<'system' | 'light' | 'dark'> = ['system', 'light', 'dark'];
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const next = CYCLE[(CYCLE.indexOf(theme) + 1) % CYCLE.length];
  const Icon = theme === 'dark' ? Moon : theme === 'light' ? Sun : Monitor;
  return (
    <button onClick={() => setTheme(next)} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" title={`Theme: ${theme}`}>
      <Icon className="h-4 w-4" />
    </button>
  );
}
