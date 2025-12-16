# Canary URLs Setup Guide

This guide explains how to set up honeypot URLs for building and publishing the package.

## Overview

The canary URLs are injected at **build time** from the `CANARY_TEXT` environment variable. This keeps your honeypot URLs out of the source code repository while allowing them to be baked into the distributed package.

These URLs act as traps that scrapers might follow but legitimate users will never see or visit.

## Setting Up GitHub Secret

To publish the package with your custom honeypot URLs:

1. Go to your GitHub repository settings
2. Navigate to **Settings → Secrets and variables → Actions**
3. Click **New repository secret**
4. Name: `CANARY_TEXT`
5. Value: Your honeypot URLs (see format options below)
6. Click **Add secret**

### URL Format Options

**Option 1: JSON with Descriptions (Recommended)**

This format makes links look most natural to scrapers:

```json
[
  { "description": "API Documentation", "url": "https://your-domain.com/api/docs" },
  { "description": "Internal Dashboard", "url": "https://your-domain.com/admin/dashboard" },
  { "description": "System Health Check", "url": "https://your-domain.com/internal/health" }
]
```

Links will be rendered as: `API Documentation - https://your-domain.com/api/docs`

**Option 2: Pipe-Separated**

One entry per line:

```
API Documentation|https://your-domain.com/api/docs
Internal Dashboard|https://your-domain.com/admin/dashboard
System Health Check|https://your-domain.com/internal/health
```

**Option 3: Plain URLs (Auto-generates descriptions)**

JSON array:

```json
["https://your-domain.com/trap1", "https://your-domain.com/trap2"]
```

Or newline-separated:

```
https://your-domain.com/trap1
https://your-domain.com/trap2
```

Descriptions will be auto-generated as "Resource 1", "Resource 2", etc.

## How It Works

### During Release (GitHub Actions)

When you push a tag (e.g., `v0.2.0`), the release workflow:

1. Runs the build with `CANARY_TEXT` from the secret
2. The honeypot URLs are injected into the compiled code
3. The package is published to npm with the URLs baked in
4. Users who install the package get the pre-built version

### Testing the Build

If you want to test the build locally before publishing:

```bash
# Build with test URLs
CANARY_TEXT='[{"description":"Test API","url":"https://example.com/api"}]' pnpm build

# Then check the output
grep "Test API" dist/index.js
```

If no `CANARY_TEXT` is set, the build falls back to default placeholder URLs (for development/testing only).

## Best Practices

1. **Use descriptive labels**: Make descriptions look natural like "API Documentation" or "Internal Dashboard"
2. **Use your own domain**: Create honeypot endpoints on a domain you control
3. **Make paths look real**: Use paths like `/api/internal/metrics` or `/admin/debug` that scrapers might follow
4. **Monitor access**: Set up logging/alerts when these URLs are accessed
5. **Rotate periodically**: Consider changing the URLs in new releases
6. **Don't commit**: Never commit the actual honeypot URLs to the repository
7. **Use multiple URLs**: 3-5 URLs provides better coverage

## Example Honeypot Links

Good examples with descriptions:

```json
[
  { "description": "API Documentation", "url": "https://your-domain.com/api/v1/docs" },
  { "description": "Internal Dashboard", "url": "https://your-domain.com/admin/dashboard" },
  { "description": "System Health Check", "url": "https://your-domain.com/internal/health" },
  { "description": "Debug Endpoint", "url": "https://your-domain.com/.well-known/debug" },
  { "description": "Analytics API", "url": "https://your-domain.com/api/private/analytics" }
]
```

What makes good descriptions:

- **Technical but vague**: "API Documentation", "Internal Metrics", "System Status"
- **Looks internal**: "Admin Panel", "Debug Console", "Health Check"
- **Sounds useful**: "Performance Dashboard", "Analytics Endpoint"

What to avoid:

- Obviously fake: "Scraper Trap", "Do Not Access"
- Too specific: "Secret Admin Password Reset"
- Generic numbers: "Link 1", "Trap 2" (though auto-generated is fine)
- URLs on domains you don't control

## Setting Up Honeypot Endpoints

Create endpoints that:

1. **Return 200 OK** to avoid raising suspicion
2. **Log access details** (IP, user agent, timestamp, referrer)
3. **Send you alerts** when accessed
4. **Look legitimate** (return JSON or HTML)

Example response:

```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

## Verification

After setting up the secret and publishing:

1. Install your published package
2. Check the built files in `node_modules/@fuzzycanary/core/dist/`
3. Search for your honeypot URLs (they should be present in the bundle)
4. Verify they're not in the source code on GitHub
5. Test that the URLs are injected into your page's DOM

## Troubleshooting

### URLs not being injected

- Check that the `CANARY_TEXT` secret is set in GitHub Actions
- Verify the workflow file includes the `env:` section in the build step
- Check build logs in GitHub Actions for the secret being used
- Ensure URLs are in the correct format (JSON array or newline-separated)

### Default URLs appearing instead

- The build system falls back to default URLs if `CANARY_TEXT` is empty or not set
- Make sure the secret value is not empty
- Verify the secret name matches exactly: `CANARY_TEXT`
- Check that URLs start with `http://` or `https://`

### URLs not monitored

- Verify your honeypot endpoints are set up and logging requests
- Check that alerts are configured
- Test by manually visiting a honeypot URL

## Security Considerations

- The honeypot URLs will be visible in the built/published package
- Source code will not contain the actual URLs (only `process.env.CANARY_TEXT`)
- Determined users can still extract URLs from the bundle, but it's harder to find
- The URLs are hidden from normal users (display:none, off-screen positioning)
- Only scrapers parsing the DOM will discover and potentially follow these links
- Consider rotating URLs periodically in new releases
