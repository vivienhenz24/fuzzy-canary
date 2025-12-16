import { describe, it, expect, vi } from 'vitest'
import { fuzzyCanaryMiddleware, stripFuzzyCanary } from '../../src/middleware'

const htmlWithCanary =
  '<html><body><span data-fuzzy-canary="true" style="display:none">payload</span><div>content</div></body></html>'

describe('middleware.ts - fuzzyCanaryMiddleware', () => {
  it('strips canary for allowlisted bots (Googlebot)', async () => {
    const request = new Request('https://example.com', {
      headers: {
        'user-agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
      },
    })

    const response = await fuzzyCanaryMiddleware(
      request,
      async () =>
        new Response(htmlWithCanary, {
          headers: { 'content-type': 'text/html; charset=utf-8', 'x-test': 'keep' },
        })
    )

    const body = await response.text()
    expect(body).not.toContain('data-fuzzy-canary')
    expect(body).toContain('content')
    expect(response.headers.get('x-test')).toBe('keep')
  })

  it('leaves canary intact for non-allowlisted user agents', async () => {
    const request = new Request('https://example.com', {
      headers: { 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120' },
    })

    const response = await fuzzyCanaryMiddleware(
      request,
      async () =>
        new Response(htmlWithCanary, {
          headers: { 'content-type': 'text/html; charset=utf-8' },
        })
    )

    const body = await response.text()
    expect(body).toContain('data-fuzzy-canary')
    expect(body).toContain('payload')
  })

  it('returns non-HTML responses untouched', async () => {
    const request = new Request('https://example.com', {
      headers: { 'user-agent': 'Googlebot/2.1' },
    })

    const jsonResponse = '{"ok":true}'

    const response = await fuzzyCanaryMiddleware(
      request,
      async () =>
        new Response(jsonResponse, {
          headers: { 'content-type': 'application/json' },
        })
    )

    expect(await response.text()).toBe(jsonResponse)
    expect(response.headers.get('content-type')).toBe('application/json')
  })

  it('exposes pure helper stripFuzzyCanary', () => {
    const cleaned = stripFuzzyCanary(htmlWithCanary)
    expect(cleaned).not.toContain('data-fuzzy-canary')
    expect(cleaned).toContain('content')
  })

  it('invokes upstream exactly once', async () => {
    const request = new Request('https://example.com', {
      headers: { 'user-agent': 'Googlebot/2.1' },
    })
    const upstream = vi.fn(
      async () => new Response(htmlWithCanary, { headers: { 'content-type': 'text/html' } })
    )

    await fuzzyCanaryMiddleware(request, upstream)

    expect(upstream).toHaveBeenCalledTimes(1)
  })
})
