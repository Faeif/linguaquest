# Security Standards — LinguaQuest
# Version: 1.0.0

## 🔐 Authentication Security

### User Tiers & Auth Methods
```
Guest:          No login required (localStorage only)
Regular User:   Google OAuth (primary) + Magic Link (fallback)
Tutor:          Google/Magic Link + Manual verification
Admin:          Email + Password + TOTP 2FA (mandatory)
```

### Session Management
```
Regular User:   30 days (Supabase default JWT)
Admin:          4 hours max, 30 min inactivity timeout
Magic Link:     15 minutes expiry
OTP (2FA):      30 seconds (TOTP standard)
Email verify:   24 hours
```

### Admin 2FA Implementation
```typescript
// Admin login requires TOTP after password
// Use: speakeasy + qrcode packages

import speakeasy from 'speakeasy'

// Verify TOTP token
export function verifyTOTP(secret: string, token: string): boolean {
  return speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
    window: 1, // Allow 30s clock skew
  })
}
```

---

## 🛡️ API Security

### Rate Limiting — All Endpoints
```typescript
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const redis = Redis.fromEnv()

// Standard API limits
export const standardLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(60, '1m'), // 60 req/min
  analytics: true,
})

// AI endpoints — tiered limits
export const aiLimitFree = new Ratelimit({
  redis,
  limiter: Ratelimit.fixedWindow(10, '1d'), // 10/day free
  analytics: true,
})

export const aiLimitPro = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(300, '1m'), // Pro = high limit
  analytics: true,
})

// Auth endpoints — strict
export const authLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.fixedWindow(5, '15m'), // 5 attempts/15min
  analytics: true,
})

// Usage in API route
const identifier = `${endpoint}:${userId ?? ip}`
const { success, limit, remaining, reset } = await ratelimit.limit(identifier)

if (!success) {
  return Response.json(
    { data: null, error: 'Too many requests' },
    {
      status: 429,
      headers: {
        'X-RateLimit-Limit': limit.toString(),
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': new Date(reset).toISOString(),
        'Retry-After': Math.ceil((reset - Date.now()) / 1000).toString(),
      },
    }
  )
}
```

### Rate Limit Table
```
Endpoint                  Free          Pro           Admin
─────────────────────────────────────────────────────────────────
POST /api/auth/*          5/15min       5/15min       5/15min
GET  /api/*               60/min        300/min       600/min
POST /api/ai/cards        20/day        unlimited     unlimited
POST /api/ai/speaking     3/week        unlimited     unlimited
POST /api/ai/essay        2/week        unlimited     unlimited
POST /api/ai/companion    15msg/day     unlimited     unlimited
POST /api/ai/study-path   1/week        unlimited     unlimited
POST /api/study/complete  200/day       unlimited     unlimited
POST /api/battle/*        50/day        unlimited     unlimited
─────────────────────────────────────────────────────────────────
```

---

## 🔒 Database Security

### Row Level Security (RLS) — Mandatory
```sql
-- ✅ Template สำหรับทุก table ที่มี user_id

-- 1. Enable RLS
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

-- 2. Users see only their data
CREATE POLICY "users_select_own" ON table_name
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users_insert_own" ON table_name
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_update_own" ON table_name
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "users_delete_own" ON table_name
  FOR DELETE USING (auth.uid() = user_id);

-- 3. Public read for community content
CREATE POLICY "public_read_approved" ON decks
  FOR SELECT USING (is_public = true AND is_approved = true);

-- 4. Admin bypass (service_role key)
-- service_role key bypasses RLS automatically
-- NEVER expose service_role key to client
```

### Sensitive Data Rules
```
✅ Store:    Hashed passwords (Supabase handles)
✅ Store:    Encrypted 2FA secrets
✅ Store:    User preferences, progress, stats

❌ Never store:
  - Payment card numbers (Omise handles)
  - Raw passwords
  - API keys in DB
  - PII beyond what's needed (name, email only)
```

---

## 🔍 Input Validation & Sanitization

### Before AI Prompts — Mandatory
```typescript
import DOMPurify from 'isomorphic-dompurify'
import { z } from 'zod'

// Sanitize before sending to AI
export function sanitizeForAI(input: string): string {
  // Remove HTML
  const clean = DOMPurify.sanitize(input, { ALLOWED_TAGS: [] })
  // Remove potential prompt injection patterns
  const safe = clean
    .replace(/ignore previous instructions/gi, '')
    .replace(/system:/gi, '')
    .replace(/\[INST\]/gi, '')
  // Limit length
  return safe.slice(0, 5000)
}

// Validate content before moderation
export const zUserContent = z.object({
  text: z.string()
    .min(1, 'Content cannot be empty')
    .max(10000, 'Content too long')
    .transform(sanitizeForAI),
})
```

### File Upload Validation
```typescript
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'application/pdf']
const MAX_SIZE_MB = 10

export function validateUpload(file: File): ValidationResult {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: 'File type not allowed' }
  }
  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    return { valid: false, error: `File too large (max ${MAX_SIZE_MB}MB)` }
  }
  return { valid: true }
}
```

---

## 🌐 HTTP Security Headers

### next.config.ts
```typescript
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(self), geolocation=()',
    // microphone=(self) เพราะต้องใช้สำหรับ Speaking Coach
  },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // Next.js requires
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self'",
      "connect-src 'self' https://*.supabase.co https://api.anthropic.com",
      "media-src 'self' blob:",
      "worker-src blob:",
    ].join('; '),
  },
]
```

---

## 🚨 Security Monitoring

### Suspicious Activity Detection
```typescript
// Track in PostHog + trigger alerts
export async function trackSuspiciousActivity(
  userId: string,
  type: 'excessive_requests' | 'failed_auth' | 'injection_attempt',
  details: Record<string, unknown>
) {
  // Log to PostHog
  posthog.capture('security_alert', {
    distinct_id: userId,
    type,
    severity: type === 'injection_attempt' ? 'critical' : 'warning',
    ...details,
    timestamp: new Date().toISOString(),
  })

  // Log to Sentry
  Sentry.captureMessage(`Security alert: ${type}`, {
    level: type === 'injection_attempt' ? 'error' : 'warning',
    extra: { userId, ...details },
  })

  // Update trust score in DB
  if (type === 'excessive_requests') {
    await supabase.rpc('decrease_trust_score', {
      p_user_id: userId,
      p_amount: 10,
    })
  }
}
```

### Audit Log (Admin Actions)
```sql
CREATE TABLE audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  target_type TEXT, -- 'user', 'deck', 'content'
  target_id UUID,
  old_value JSONB,
  new_value JSONB,
  ip_address INET,
  severity TEXT DEFAULT 'info', -- 'info', 'warning', 'critical'
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Auto-log every admin action via trigger
```

---

## ✅ Security Checklist (Before Deploy)

```
Authentication:
□ Google OAuth configured correctly
□ Magic Link expiry = 15 minutes
□ Admin 2FA enabled and tested
□ Session timeout configured

API:
□ Rate limiting on ALL endpoints
□ Zod validation on ALL inputs
□ Auth check on ALL protected routes
□ CORS configured (Vercel handles)

Database:
□ RLS enabled on ALL tables
□ service_role key never in client code
□ No sensitive data in public schema

Headers:
□ Security headers in next.config.ts
□ CSP configured and tested
□ HTTPS only (Vercel enforces)

AI:
□ Input sanitization before AI prompts
□ Rate limiting on AI endpoints
□ Cost monitoring alerts set

Monitoring:
□ Sentry configured and tested
□ PostHog security events tracked
□ Azure budget alerts set
```
