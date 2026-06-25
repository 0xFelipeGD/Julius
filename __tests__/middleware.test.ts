import { describe, expect, it } from 'vitest'
import { config } from '@/middleware'

const middlewareMatcher = new RegExp(`^${config.matcher[0]}$`)

const isHandledByMiddleware = (pathname: string) => middlewareMatcher.test(pathname)

describe('middleware matcher', () => {
  it('lets PWA install assets bypass auth middleware', () => {
    expect(isHandledByMiddleware('/manifest.json')).toBe(false)
    expect(isHandledByMiddleware('/sw.js')).toBe(false)
    expect(isHandledByMiddleware('/workbox-a1b2c3d4.js')).toBe(false)
    expect(isHandledByMiddleware('/swe-worker-development.js')).toBe(false)
    expect(isHandledByMiddleware('/icons/icon-192.png')).toBe(false)
  })

  it('still protects application routes', () => {
    expect(isHandledByMiddleware('/login')).toBe(true)
    expect(isHandledByMiddleware('/chat')).toBe(true)
    expect(isHandledByMiddleware('/settings')).toBe(true)
  })
})
