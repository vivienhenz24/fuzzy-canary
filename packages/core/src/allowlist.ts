/**
 * Allowlist of legitimate bots that should NOT see the canary.
 *
 * This includes:
 * - Core search engine crawlers (Google, Bing, Apple, DuckDuckGo)
 * - Regional search crawlers (Baidu, Yandex, Naver, Seznam, Mojeek)
 * - Link preview / unfurl fetchers (Meta, X/Twitter, LinkedIn, Slack, Discord, Telegram, Pinterest)
 */

// Core search engines
const GOOGLE_BOTS = 'googlebot'
const MICROSOFT_BOTS = 'bingbot|msnbot'
const APPLE_BOTS = 'applebot'
const DUCKDUCKGO_BOTS = 'duckduckbot'

// Regional search engines
const BAIDU_BOTS = 'baiduspider'
const YANDEX_BOTS = 'yandexbot|yandex'
const NAVER_BOTS = 'yeti'
const SEZNAM_BOTS = 'seznambot'
const MOJEEK_BOTS = 'mojeekbot'

// Link preview / unfurl fetchers
const META_BOTS = 'facebookexternalhit|facebot'
const TWITTER_BOTS = 'twitterbot'
const LINKEDIN_BOTS = 'linkedinbot'
const SLACK_BOTS = 'slackbot-linkexpanding|slackbot'
const DISCORD_BOTS = 'discordbot'
const TELEGRAM_BOTS = 'telegrambot'
const PINTEREST_BOTS = 'pinterestbot'

// Combined regex pattern
const ALLOWLIST_PATTERN = [
  // Search engines
  GOOGLE_BOTS,
  MICROSOFT_BOTS,
  APPLE_BOTS,
  DUCKDUCKGO_BOTS,
  BAIDU_BOTS,
  YANDEX_BOTS,
  NAVER_BOTS,
  SEZNAM_BOTS,
  MOJEEK_BOTS,
  // Link preview fetchers
  META_BOTS,
  TWITTER_BOTS,
  LINKEDIN_BOTS,
  SLACK_BOTS,
  DISCORD_BOTS,
  TELEGRAM_BOTS,
  PINTEREST_BOTS,
].join('|')

const BOT_REGEX = new RegExp(`(${ALLOWLIST_PATTERN})`, 'i')

/**
 * Check if a user agent string matches a bot in the allowlist.
 * Bots in the allowlist should NOT see the canary.
 */
export const isAllowlistedBot = (userAgent: string): boolean => {
  return BOT_REGEX.test(userAgent)
}
