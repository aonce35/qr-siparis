self.addEventListener("push", function (event) {
  let data = {};

  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = {
      title: "Yeni Sipariş",
      body: "Yeni bir sipariş geldi."
    };
  }

  const title = data.title || "🔔 Yeni Sipariş";

  const options = {
    body: data.body || "Yeni bir sipariş geldi.",
    icon: "/qr-siparis/admin/icon-192.png",
    badge: "/qr-siparis/admin/icon-192.png",
    data: {
      url: "/qr-siparis/admin/"
    }
  };

  event.waitUntil(
    self.registration.showNotification(
      title,
      options
    )
  );
});

self.addEventListener(
  "notificationclick",
  function (event) {
    event.notification.close();

    event.waitUntil(
      clients.openWindow(
        "/qr-siparis/admin/"
      )
    );
  }
);
