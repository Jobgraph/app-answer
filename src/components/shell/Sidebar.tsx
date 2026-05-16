import { Plus, Trash2, MessageSquare, Clock } from 'lucide-react';
import type { Conversation } from '../../lib/types';
import { relativeTime } from '../../lib/utils';

interface SidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
}

export function Sidebar({ conversations, activeId, onSelect, onNew, onDelete, onClearAll }: SidebarProps) {
  return (
    <aside className="w-64 border-r border-border bg-card flex flex-col h-full shrink-0">
      <div className="p-3 border-b border-border">
        <button onClick={onNew} className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
          <Plus className="h-4 w-4" /> New chat
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="px-4 py-8 text-center text-xs text-muted-foreground">
            <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-40" />
            <p>No conversations yet</p>
          </div>
        ) : (
          <div className="py-1">
            {conversations.map((c) => (
              <div key={c.id} onClick={() => onSelect(c.id)}
                className={`group flex items-start gap-2 px-3 py-2.5 mx-1 rounded-lg cursor-pointer transition-colors ${activeId === c.id ? 'bg-primary/10 text-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{c.title}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Clock className="h-3 w-3 opacity-50" />
                    <span className="text-[10px] opacity-60">{relativeTime(c.createdAt)}</span>
                    <span className="text-[10px] opacity-40">{c.messages.length} msgs</span>
                  </div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); onDelete(c.id); }} className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-all">
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      {conversations.length > 0 && (
        <div className="p-3 border-t border-border">
          <button onClick={onClearAll} className="text-[10px] text-muted-foreground hover:text-destructive transition-colors">Clear all</button>
        </div>
      )}
    </aside>
  );
}
