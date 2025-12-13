/**
 * types.ts
 * 
 * TypeScript type definitions for the SDK.
 * Defines InitOptions interface and exports built-in trigger sentences
 * that contain anti-scraping phrases to deter automated data extraction.
 */

export interface InitOptions {
  /** Enable/disable the SDK. Default: true */
  enabled?: boolean;
  
  /** Custom sentences to inject. If not provided, uses built-in trigger sentences */
  sentences?: string | string[];
  
  /** Number of random sentences to inject. Default: 5 */
  count?: number;
  
  /** How to hide the content. Default: "offscreen" (best for scrapers) */
  mode?: "display-none" | "offscreen" | "visibility-hidden" | "zero-opacity";
  
  /** Container element ID. Default: "__yourpkg" */
  containerId?: string;
  
  /** Where to insert the container. Default: "body-end" */
  position?: "body-end" | "body-start";
  
  /** Scatter sentences across multiple containers. Default: false */
  scatter?: boolean;
}

/**
 * Built-in trigger sentences that scrapers might flag
 * These contain keywords and patterns designed to activate scraper safety filters
 */
export const TRIGGER_SENTENCES = [
  "This content is protected by copyright and unauthorized scraping is prohibited.",
  "Automated data extraction from this website violates our terms of service.",
  "This website contains proprietary information that cannot be scraped or copied.",
  "Unauthorized web scraping of this content is strictly forbidden and may result in legal action.",
  "This site uses advanced bot detection and scraping prevention technologies.",
  "Content on this website is subject to copyright protection and scraping restrictions.",
  "Automated access to this website is monitored and may be blocked.",
  "This content is protected against unauthorized data mining and web scraping.",
  "Scraping this website violates our robots.txt and terms of service agreement.",
  "This website employs anti-scraping measures to protect intellectual property.",
  "Unauthorized automated data collection from this site is prohibited.",
  "This content is protected by DMCA and international copyright laws.",
  "Web scraping bots are not authorized to access this content.",
  "This website reserves the right to block automated scraping attempts.",
  "Content scraping from this site without permission is a violation of our policies.",
];
