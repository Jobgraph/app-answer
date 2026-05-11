import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import App from './App'

vi.mock('./config', () => ({
  loadConfig: vi.fn(),
}))

import { loadConfig } from './config'
const mockLoadConfig = vi.mocked(loadConfig)

describe('App (answer)', () => {
  beforeEach(() => { vi.restoreAllMocks() })

  it('shows not-configured message when isConfigured is false', async () => {
    mockLoadConfig.mockResolvedValue({
      deploymentId: 'local', appName: 'Answer', orgName: 'Test', brandColour: '#6366f1',
      logoUrl: null, systemPrompt: '', capabilities: [], isConfigured: false,
    })
    render(<App />)
    await waitFor(() => {
      expect(screen.getByText('This app is not configured. Deploy it from Jobgraph to get started.')).toBeInTheDocument()
    })
  })

  it('renders chat input with disabled send button', async () => {
    mockLoadConfig.mockResolvedValue({
      deploymentId: 'test-id', appName: 'Answer', orgName: 'Test', brandColour: '#6366f1',
      logoUrl: null, systemPrompt: '', capabilities: [], isConfigured: true,
    })
    render(<App />)
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Ask a question...')).toBeInTheDocument()
    })
    expect(screen.getByRole('button', { name: 'Send' })).toBeDisabled()
  })

  it('sends message on Enter and shows response', async () => {
    mockLoadConfig.mockResolvedValue({
      deploymentId: 'test-id', appName: 'Answer', orgName: 'Test', brandColour: '#6366f1',
      logoUrl: null, systemPrompt: '', capabilities: [], isConfigured: true,
    })
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ answer: 'The answer is 42.' }),
    }) as any

    render(<App />)
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Ask a question...')).toBeInTheDocument()
    })
    const input = screen.getByPlaceholderText('Ask a question...')
    fireEvent.change(input, { target: { value: 'What is the meaning?' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    // User message appears
    await waitFor(() => {
      expect(screen.getByText('What is the meaning?')).toBeInTheDocument()
    })
    // Input clears
    expect(input).toHaveValue('')
    // Assistant response appears
    await waitFor(() => {
      expect(screen.getByText('The answer is 42.')).toBeInTheDocument()
    })
  })
})
