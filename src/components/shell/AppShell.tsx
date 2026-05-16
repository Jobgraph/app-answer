import { useState, type ReactNode } from 'react';
import type { AppConfig } from '../../lib/config';
import type { Conversation } from '../../lib/types';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

interface Props {
  config: AppConfig;
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
  children: ReactNode;
}

export function AppShell({ config, conversations, activeId, onSelect, onNew, onDelete, onClearAll, children }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header config={config} onMenuClick={() => setMobileOpen(!mobileOpen)} />
      <div className="flex flex-1 overflow-hidden">
        <div className="hidden md:flex">
          <Sidebar conversations={conversations} activeId={activeId} onSelect={onSelect} onNew={onNew} onDelete={onDelete} onClearAll={onClearAll} />
        </div>
        {mobileOpen && (
          <>
            <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setMobileOpen(false)} />
            <div className="fixed inset-y-0 left-0 z-50 md:hidden">
              <Sidebar conversations={conversations} activeId={activeId} onSelect={(id) => { onSelect(id); setMobileOpen(false); }} onNew={() => { onNew(); setMobileOpen(false); }} onDelete={onDelete} onClearAll={onClearAll} />
            </div>
          </>
        )}
        <main className="flex-1 overflow-hidden flex flex-col">{children}</main>
      </div>
    </div>
  );
}
