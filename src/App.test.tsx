import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import App from './App'

vi.mock('./lib/config', () => ({
  loadConfig: vi.fn(),
}))

import { loadConfig } from './lib/config'
const mockLoadConfig = vi.mocked(loadConfig)

// Mock crypto.randomUUID
let uuidCounter = 0
Object.defineProperty(globalThis, 'crypto', {
  value: {
    randomUUID: () => `test-uuid-${++uuidCounter}`,
  },
})

// Mock matchMedia for theme
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: query === '(prefers-color-scheme: dark)',
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

describe('App (answer)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    uuidCounter = 0
    localStorage.clear()
  })

  it('shows not-configured message when isConfigured is false', async () => {
    mockLoadConfig.mockResolvedValue({
      deploymentId: 'test-id', appName: 'Answer', orgName: 'Test', brandColour: '#6366f1',
      logoUrl: null, systemPrompt: '', capabilities: [], isConfigured: false,
    })
    render(<App />)
    await waitFor(() => {
      expect(screen.getByText('This app is not yet configured. Deploy it from Jobgraph to get started.')).toBeInTheDocument()
    })
  })

  it('renders chat input when configured', async () => {
    mockLoadConfig.mockResolvedValue({
      deploymentId: 'test-id', appName: 'Answer', orgName: 'Test', brandColour: '#6366f1',
      logoUrl: null, systemPrompt: '', capabilities: [], isConfigured: true,
    })
    render(<App />)
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Ask a question...')).toBeInTheDocument()
    })
  })

  it('sends message on Enter and shows mock response', async () => {
    mockLoadConfig.mockResolvedValue({
      deploymentId: 'test-id', appName: 'Answer', orgName: 'Test', brandColour: '#6366f1',
      logoUrl: null, systemPrompt: '', capabilities: [], isConfigured: true,
    })

    render(<App />)
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Ask a question...')).toBeInTheDocument()
    })
    const input = screen.getByPlaceholderText('Ask a question...')
    fireEvent.change(input, { target: { value: 'What is the refund policy?' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    // User message appears (also shown in sidebar title, so use getAllByText)
    await waitFor(() => {
      expect(screen.getAllByText('What is the refund policy?').length).toBeGreaterThanOrEqual(1)
    })
    // Input clears
    expect(input).toHaveValue('')
    // Mock assistant response appears (from lib/mock.ts)
    await waitFor(() => {
      expect(screen.getByText(/refund policy allows full refunds/)).toBeInTheDocument()
    }, { timeout: 3000 })
  })
})
