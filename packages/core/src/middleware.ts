import { isAllowlistedBot } from './allowlist'

const CANARY_REGEX = /<span[^>]*data-fuzzy-canary=["']?true["']?[^>]*>[\s\S]*?<\/span>/i

const isHtmlResponse = (headers: Headers): boolean => {
  const contentType = headers.get('content-type') || ''
  return contentType.toLowerCase().includes('text/html')
}

const stripCanaryFromHtml = (html: string): string => html.replace(CANARY_REGEX, '')

/**
 * Edge-friendly middleware that strips the canary from HTML responses
 * when the incoming request is from an allowlisted bot.
 *
 * Usage (one-liner):
 *   export { fuzzyCanaryMiddleware as middleware } from '@fuzzycanary/core/middleware'
 *
 * Works in any fetch-compatible edge runtime (Next.js middleware, Cloudflare Workers, etc.).
 * By default it proxies to the origin with `fetch(request)`; pass a custom `upstream`
 * if your platform requires it.
 */
export async function fuzzyCanaryMiddleware(
  request: Request,
  upstream: (req: Request) => Promise<Response> = req => fetch(req)
): Promise<Response> {
  const ua = request.headers.get('user-agent') || ''
  const response = await upstream(request)

  if (!isAllowlistedBot(ua)) return response
  if (!isHtmlResponse(response.headers)) return response

  const text = await response.text()
  const cleaned = stripCanaryFromHtml(text)

  // Clone headers and drop content-length since body changed
  const headers = new Headers(response.headers)
  headers.delete('content-length')

  return new Response(cleaned, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}

export const stripFuzzyCanary = stripCanaryFromHtml
