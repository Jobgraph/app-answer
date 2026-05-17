import { useState, useCallback, useRef, useEffect } from 'react';
import { ThemeContext } from './lib/theme';
import type { Message, Conversation } from './lib/types';
import { getMockAnswer } from './lib/mock';
import { processInput } from './lib/api';
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
  const [toast, setToast] = useState<string | null>(null);
  const activeIdRef = useRef<string | null>(null);
  activeIdRef.current = activeId;

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(t);
  }, [toast]);

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

      const pendingConversationId = conversation.id;

      const appendAssistant = (answer: string) => {
        // Guard: if the user switched conversations, don't clobber state
        if (activeIdRef.current !== pendingConversationId) {
          setResponding(false);
          return;
        }

        const assistantMessage: Message = {
          id: uid(),
          role: 'assistant',
          content: answer,
          timestamp: new Date().toISOString(),
        };

        // Re-read fresh conversation data instead of using the stale closure
        const freshConversations = getConversations();
        const freshConversation = freshConversations.find(
          (c) => c.id === pendingConversationId,
        );
        if (!freshConversation) {
          setResponding(false);
          return;
        }

        const updated: Conversation = {
          ...freshConversation,
          messages: [...freshConversation.messages, assistantMessage],
        };
        updateConversation(updated);
        setConversations(getConversations());
        setResponding(false);
      };

      if (config && config.isConfigured && config.deploymentId !== 'local') {
        processInput(config, text)
          .then((response) => {
            appendAssistant(response.result);
          })
          .catch((err: Error) => {
            setResponding(false);
            if (err.message === 'RATE_LIMITED') {
              setToast('Too many requests. Please wait a moment and try again.');
            } else {
              setToast(err.message || 'Something went wrong. Please try again.');
            }
          });
      } else {
        setTimeout(() => {
          appendAssistant(getMockAnswer(text));
        }, 800);
      }
    },
    [activeConversation, responding, config],
  );

  const handleSelect = useCallback((id: string) => {
    setActiveId(id);
    setResponding(false);
  }, []);

  const handleNew = useCallback(() => {
    setActiveId(null);
    setResponding(false);
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

      {toast && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 max-w-md w-full px-4">
          <div className="bg-destructive text-destructive-foreground rounded-lg px-4 py-3 text-sm shadow-lg flex items-center justify-between gap-3">
            <span>{toast}</span>
            <button onClick={() => setToast(null)} className="shrink-0 opacity-70 hover:opacity-100 transition-opacity font-bold">&times;</button>
          </div>
        </div>
      )}
    </ThemeContext>
  );
}
