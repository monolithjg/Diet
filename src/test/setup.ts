import '@testing-library/jest-dom'
import React from 'react'
import { vi } from 'vitest'

vi.mock('recharts', async () => {
  const actual = await vi.importActual<typeof import('recharts')>('recharts')

  return {
    ...actual,
    ResponsiveContainer: ({
      children,
      width = '100%',
      height = '100%'
    }: {
      children: React.ReactNode | ((size: { width: number; height: number }) => React.ReactNode)
      width?: number | string
      height?: number | string
    }) => {
      const resolvedWidth = typeof width === 'number' ? width : 400
      const resolvedHeight = typeof height === 'number' ? height : 300

      return React.createElement(
        'div',
        { style: { width: resolvedWidth, height: resolvedHeight } },
        typeof children === 'function'
          ? children({ width: resolvedWidth, height: resolvedHeight })
          : children
      )
    }
  }
})

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
