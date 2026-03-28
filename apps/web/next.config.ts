import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { withSentryConfig } from '@sentry/nextjs'
import withSerwistInit from '@serwist/next'
import type { NextConfig } from 'next'

const appDir = path.dirname(fileURLToPath(import.meta.url))
const workspaceRoot = path.resolve(appDir, '../..')

function loadWorkspaceEnv() {
  const nodeEnv = process.env.NODE_ENV ?? 'development'
  const envFiles = [
    `.env.${nodeEnv}.local`,
    nodeEnv === 'test' ? null : '.env.local',
    `.env.${nodeEnv}`,
    '.env',
  ].filter((file): file is string => file !== null)

  for (const envFile of envFiles) {
    const envPath = path.join(workspaceRoot, envFile)

    if (!existsSync(envPath)) {
      continue
    }

    const lines = readFileSync(envPath, 'utf8').split(/\r?\n/)

    for (const rawLine of lines) {
      const line = rawLine.trim()

      if (!line || line.startsWith('#')) {
        continue
      }

      const separatorIndex = line.indexOf('=')

      if (separatorIndex === -1) {
        continue
      }

      const key = line
        .slice(0, separatorIndex)
        .replace(/^export\s+/, '')
        .trim()

      if (!key || process.env[key] !== undefined) {
        continue
      }

      let value = line.slice(separatorIndex + 1).trim()

      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1)
      }

      process.env[key] = value
    }
  }
}

// Load monorepo-level env files so the app can share a single root .env.local.
loadWorkspaceEnv()

const withSerwist = withSerwistInit({
  swSrc: 'src/app/sw.ts',
  swDest: 'public/sw.js',
})

const nextConfig: NextConfig = {
  transpilePackages: [
    '@linguaquest/db',
    '@linguaquest/core',
    '@linguaquest/utils',
    'simple-ts-fsrs',
  ],
  serverExternalPackages: ['require-in-the-middle'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
}

export default withSentryConfig(withSerwist(nextConfig), {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options

  org: 'your-sentry-org',
  project: 'linguaquest-web',

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: '/monitoring',

  // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
  // See the following for more information:
  // https://docs.sentry.io/product/crons/
  // https://vercel.com/docs/cron-jobs
  automaticVercelMonitors: true,
})
