import webpush from 'web-push'

if (
  process.env.VAPID_PUBLIC_KEY &&
  process.env.VAPID_PRIVATE_KEY &&
  process.env.VAPID_SUBJECT
) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT,
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  )
}

export async function sendPushNotification(
  subscription: webpush.PushSubscription,
  title: string,
  body: string,
  url = '/'
) {
  return webpush.sendNotification(
    subscription,
    JSON.stringify({ title, body, url })
  )
}
