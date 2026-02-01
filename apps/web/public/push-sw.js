self.addEventListener("push", (event) => {
  const payload = event.data ? event.data.json() : {}
  const title = payload.title || "こんだてLoop"
  const options = {
    body: payload.body || "新しい通知が届きました。",
    icon: "/vite.svg",
    badge: "/vite.svg",
    data: payload.url || "/",
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener("notificationclick", (event) => {
  event.notification.close()
  const targetUrl = event.notification.data || "/"
  event.waitUntil(self.clients.openWindow(targetUrl))
})
