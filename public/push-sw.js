(() => {
  self.addEventListener("push", (event) => {
    let payload = {};

    if (event.data) {
      try {
        payload = event.data.json();
      } catch {
        payload = { body: event.data.text() };
      }
    }

    if (!payload || typeof payload !== "object") {
      payload = { body: String(payload ?? "") };
    }

    const notificationUrl = new URL(
      typeof payload.url === "string"
        ? payload.url
        : typeof payload.data?.url === "string"
          ? payload.data.url
          : "/",
      self.location.origin,
    );
    const targetUrl =
      notificationUrl.origin === self.location.origin
        ? notificationUrl.href
        : self.location.origin;

    event.waitUntil(
      self.registration.showNotification(
        typeof payload.title === "string" && payload.title
          ? payload.title
          : "Radu Burziņš",
        {
          body: typeof payload.body === "string" ? payload.body : "",
          icon: "/icons/rb-icon-192.png",
          badge: "/icons/rb-icon-192.png",
          tag: typeof payload.tag === "string" ? payload.tag : undefined,
          data: { url: targetUrl },
        },
      ),
    );
  });

  self.addEventListener("notificationclick", (event) => {
    event.notification.close();

    const notificationUrl = new URL(
      event.notification.data?.url || "/",
      self.location.origin,
    );
    const targetUrl =
      notificationUrl.origin === self.location.origin
        ? notificationUrl.href
        : self.location.origin;

    event.waitUntil(
      self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(
        (clients) => {
          const existingClient = clients.find(
            (client) => new URL(client.url).origin === self.location.origin,
          );

          if (existingClient) {
            return existingClient.navigate(targetUrl).then((client) =>
              (client || existingClient).focus(),
            );
          }

          return self.clients.openWindow(targetUrl);
        },
      ),
    );
  });
})();
