/// <reference types="vite/client" />

declare global {
  interface Window {
    __JOBGRAPH_CONFIG__?: Record<string, unknown>;
  }
}
