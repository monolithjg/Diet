import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock ResizeObserver for Recharts tests
class MockResizeObserver {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
  constructor(_callback: ResizeObserverCallback) {
    // Parameter prefixed with underscore to indicate intentional non-use
  }
}

global.ResizeObserver = MockResizeObserver as any 