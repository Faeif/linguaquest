import { defaultCache } from '@serwist/next/worker'
import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist'
import { Serwist } from 'serwist'

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined
  }
}

declare const self: WorkerGlobalScope & typeof globalThis & {
  registration: ServiceWorkerRegistration
  // biome-ignore lint/suspicious/noExplicitAny: SW clients API not in lib.dom for worker context
  clients: any
}

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
})

serwist.addEventListeners()

// Push notification handler
// biome-ignore lint/suspicious/noExplicitAny: service worker event types not in lib.dom
self.addEventListener('push', (event: any) => {
  if (!event.data) return
  const data = event.data.json() as { title: string; body: string; url?: string }
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-192x192.png',
      data: { url: data.url ?? '/' },
      requireInteraction: false,
    })
  )
})

// biome-ignore lint/suspicious/noExplicitAny: service worker event types not in lib.dom
self.addEventListener('notificationclick', (event: any) => {
  event.notification.close()
  event.waitUntil(
    self.clients
      // biome-ignore lint/suspicious/noExplicitAny: service worker client type
      .matchAll({ type: 'window', includeUncontrolled: true })
      // biome-ignore lint/suspicious/noExplicitAny: service worker client type
      .then((clientList: any[]) => {
        const url = (event.notification.data as { url: string }).url
        for (const client of clientList) {
          if (client.url === url && 'focus' in client) return client.focus()
        }
        return self.clients.openWindow(url)
      })
  )
})
