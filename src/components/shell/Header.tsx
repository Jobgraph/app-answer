import { Menu } from 'lucide-react';
import type { AppConfig } from '../../lib/config';
import { ThemeToggle } from './ThemeToggle';
interface HeaderProps { config: AppConfig; onMenuClick: () => void; }
export function Header({ config, onMenuClick }: HeaderProps) {
  return (
    <header className="h-14 border-b border-border px-4 flex items-center gap-3 shrink-0 bg-card">
      <button onClick={onMenuClick} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors md:hidden"><Menu className="h-5 w-5" /></button>
      {config.logoUrl && <img src={config.logoUrl} alt="" className="h-7 w-7 rounded shrink-0" />}
      <h1 className="text-base font-bold text-foreground truncate">{config.appName}</h1>
      <span className="text-xs text-muted-foreground truncate hidden sm:inline">{config.orgName}</span>
      <div className="flex-1" />
      <ThemeToggle />
    </header>
  );
}
