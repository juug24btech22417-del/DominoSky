# Security Policy & Architecture

## Overview
Domino Sky is an enterprise-grade Network Operations Intelligence platform engineered with a strict **defense-in-depth** model for aviation operations control centers (OCC).

## Security Standards & Threat Model

### 1. Deterministic Client-Side Sandboxing
- **Zero Remote Code Execution (RCE):** The entire simulation graph engine operates deterministically in memory. No user inputs are passed to `eval()`, `Function()`, or serialized into shell processes.
- **No Dynamic HTML Injection:** All dynamic strings (flight IDs, airport codes, tail numbers) are strictly typed and rendered through React JSX text interpolation with zero use of `dangerouslySetInnerHTML`.

### 2. Content Security Policy (CSP)
Domino Sky enforces a strict Content Security Policy defined in `index.html`:
- `default-src 'self'`
- `script-src 'self' 'unsafe-inline'`
- `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`
- `font-src 'self' https://fonts.gstatic.com data:`
- `img-src 'self' data: blob: https://*.tile.openstreetmap.org https://server.arcgisonline.com`
- `connect-src 'self'`
- `object-src 'none'`
- `base-uri 'self'`
- `frame-ancestors 'none'`

### 3. HTTP Security Headers
- `X-Content-Type-Options: nosniff` (prevention of MIME-sniffing)
- `X-Frame-Options: DENY` (clickjacking defense)
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()`

### 4. Input Sanitization & Bounds Checking
- All scenario inputs (closure duration, time scrubber, search terms) are strictly clamped within validated ranges:
  - Airport code: Whitelist match against the 10 supported DGCA hubs (`DEL`, `BOM`, `BLR`, `MAA`, `CCU`, `HYD`, `AMD`, `JAI`, `PNQ`, `LKO`).
  - Duration: Clamped between `15` and `240` minutes.
  - Search query: Regex-safe string escaping preventing ReDoS (Regular Expression Denial of Service).

### 5. Dependency Audit & Vulnerability Management
- All dependencies are audited via `npm audit` with **0 vulnerabilities**.
- Lockfile integrity is cryptographically pinned in `package-lock.json`.

## Vulnerability Reporting
If you discover a security vulnerability, please submit a responsible disclosure report to:
- **Security Contact:** `security@dominosky.aero`
- Response SLA: Within 24 hours.
