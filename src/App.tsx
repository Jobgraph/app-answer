import { useState, useCallback } from 'react';
import { ThemeContext } from './lib/theme';
import type { Message, Conversation } from './lib/types';
import { getMockAnswer } from './lib/mock';
import {
  getConversations,
  addConversation,
  updateConversation,
  deleteConversation,
  clearAll,
} from './lib/history';
import { useThemeProvider } from './hooks/useTheme';
import { useConfig } from './hooks/useConfig';
import { AppShell } from './components/shell/AppShell';
import { ChatPanel } from './components/answer/ChatPanel';

function uid(): string {
  return crypto.randomUUID();
}

export default function App() {
  const themeCtx = useThemeProvider();
  const { config, loading } = useConfig();

  const [conversations, setConversations] = useState<Conversation[]>(getConversations);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [responding, setResponding] = useState(false);

  const activeConversation = conversations.find((c) => c.id === activeId) ?? null;
  const messages = activeConversation?.messages ?? [];

  const handleSend = useCallback(
    (text: string) => {
      if (responding) return;

      const userMessage: Message = {
        id: uid(),
        role: 'user',
        content: text,
        timestamp: new Date().toISOString(),
      };

      let conversation: Conversation;

      if (activeConversation) {
        conversation = {
          ...activeConversation,
          messages: [...activeConversation.messages, userMessage],
        };
        updateConversation(conversation);
      } else {
        conversation = {
          id: uid(),
          title: text.length > 40 ? text.slice(0, 40) + '...' : text,
          messages: [userMessage],
          createdAt: new Date().toISOString(),
        };
        addConversation(conversation);
      }

      setConversations(getConversations());
      setActiveId(conversation.id);
      setResponding(true);

      setTimeout(() => {
        const answer = getMockAnswer(text);
        const assistantMessage: Message = {
          id: uid(),
          role: 'assistant',
          content: answer,
          timestamp: new Date().toISOString(),
        };

        const updated: Conversation = {
          ...conversation,
          messages: [...conversation.messages, assistantMessage],
        };
        updateConversation(updated);
        setConversations(getConversations());
        setResponding(false);
      }, 800);
    },
    [activeConversation, responding],
  );

  const handleSelect = useCallback((id: string) => {
    setActiveId(id);
  }, []);

  const handleNew = useCallback(() => {
    setActiveId(null);
  }, []);

  const handleDelete = useCallback(
    (id: string) => {
      deleteConversation(id);
      setConversations(getConversations());
      if (activeId === id) setActiveId(null);
    },
    [activeId],
  );

  const handleClearAll = useCallback(() => {
    clearAll();
    setConversations([]);
    setActiveId(null);
  }, []);

  if (loading || !config) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-1.5 w-1.5 bg-primary rounded-full animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!config.isConfigured && config.deploymentId !== 'local') {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-background p-6">
        <div className="text-center max-w-md space-y-4">
          <h1 className="text-2xl font-extrabold text-foreground">{config.appName}</h1>
          <p className="text-sm text-muted-foreground">This app is not yet configured. Deploy it from Jobgraph to get started.</p>
          <a href="https://app.jobgraph.com" className="inline-block px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">Go to Jobgraph</a>
        </div>
      </div>
    );
  }

  return (
    <ThemeContext value={themeCtx}>
      <AppShell
        config={config}
        conversations={conversations}
        activeId={activeId}
        onSelect={handleSelect}
        onNew={handleNew}
        onDelete={handleDelete}
        onClearAll={handleClearAll}
      >
        <ChatPanel
          messages={messages}
          onSend={handleSend}
          loading={responding}
          brandColour={config.brandColour}
        />
      </AppShell>
    </ThemeContext>
  );
}
