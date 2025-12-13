# @yourpkg/core

Core package for the anti-scraping SDK. Injects hidden text into the DOM that is visible to web scrapers but not to human users. The injected content contains trigger phrases designed to activate scraper safeguards, discouraging automated data extraction while maintaining SEO and accessibility compliance.

## Purpose

This SDK helps protect websites from unauthorized scraping by injecting content that:
- Is visible to scrapers (in the DOM and `textContent`)
- Is invisible to human visitors (using offscreen positioning, display:none, etc.)
- Contains phrases that may trigger scraper safety filters
- Doesn't harm SEO or accessibility (uses aria-hidden, proper positioning)

## Installation

Coming soon - package will be published to npm as `@yourpkg/core`

## Usage

Coming soon - see main repository documentation

