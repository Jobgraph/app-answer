import type { Conversation } from './types';

const KEY = 'jg-answer-history';
const MAX = 50;

export function getConversations(): Conversation[] {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
}

function save(convos: Conversation[]) {
  localStorage.setItem(KEY, JSON.stringify(convos.slice(0, MAX)));
}

export function addConversation(c: Conversation) {
  const all = getConversations();
  all.unshift(c);
  save(all);
}

export function updateConversation(c: Conversation) {
  const all = getConversations();
  const idx = all.findIndex(x => x.id === c.id);
  if (idx !== -1) all[idx] = c; else all.unshift(c);
  save(all);
}

export function deleteConversation(id: string) {
  save(getConversations().filter(c => c.id !== id));
}

export function clearAll() {
  localStorage.removeItem(KEY);
}
