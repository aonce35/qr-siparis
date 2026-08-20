const SUPABASE_URL = "https://dppqwgsawarkyzzonzyu.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_fhNovHoi8Xgh1jScRsdrgQ_ZCe6I4tP";

const db = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

let orders = [];
let realtimeStarted = false;

document.addEventListener("DOMContentLoaded", init);

async function init() {
  console.log("ADMIN APP BAŞLADI");

  const {
    data: { session },
    error
  } = await db.auth.getSession();

  if (error) {
    console.error("SESSION ERROR:", error);
    showLoginError("Oturum kontrolü başarısız: " + error.message);
    return;
  }

  if (session) {
    await showApp();
  }
}

async function login() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  if (!email || !password) {
    showLoginError("E-posta ve şifre gerekli.");
    return;
  }

  showLoginError("");

  const button = document.querySelector("#loginView button");

  if (button) {
    button.disabled = true;
    button.textContent = "Giriş yapılıyor...";
  }

  const { data, error } = await db.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    console.error("LOGIN ERROR:", error);

    showLoginError(
      "Giriş başarısız: " + error.message
    );

    if (button) {
      button.disabled = false;
      button.textContent = "Giriş Yap";
    }

    return;
  }

  console.log("LOGIN BAŞARILI:", data.user);

  await showApp();
}

async function logout() {
  await db.auth.signOut();
  location.reload();
}

async function showApp() {
  const loginView = document.getElementById("loginView");
  const appView = document.getElementById("appView");

  if (loginView) {
    loginView.classList.add("hidden");
  }

  if (appView) {
    appView.classList.remove("hidden");
  }

  await loadOrders();

  if (!realtimeStarted) {
    realtimeStarted = true;

    db.channel("orders-live")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders"
        },
        () => loadOrders()
      )
      .subscribe();

    db.channel("items-live")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "order_items"
        },
        () => loadOrders()
      )
      .subscribe();
  }
}

async function loadOrders() {
  console.log("SİPARİŞLER YÜKLENİYOR...");

  const { data, error } = await db
    .from("orders")
    .select(`
      *,
      order_items (*)
    `)
    .order("created_at", {
      ascending: false
    });

  if (error) {
    console.error("ORDERS ERROR:", error);

    const ordersElement =
      document.getElementById("orders");

    if (ordersElement) {
      ordersElement.innerHTML = `
        <div class="order">
          <strong>Siparişler yüklenemedi.</strong>
          <p>${esc(error.message)}</p>
        </div>
      `;
    }

    return;
  }

  orders = data || [];

  console.log("YÜKLENEN SİPARİŞLER:", orders);

  render();
}

function render() {
  const newOrders = orders.filter(
    order => order.status === "new"
  );

  const preparingOrders = orders.filter(
    order => order.status === "preparing"
  );

  const readyOrders = orders.filter(
    order => order.status === "ready"
  );

  const activeOrders = orders.filter(
    order => order.status !== "completed"
  );

  const newCount =
    document.getElementById("newCount");

  const prepCount =
    document.getElementById("prepCount");

  const readyCount =
    document.getElementById("readyCount");

  const ordersElement =
    document.getElementById("orders");

  if (newCount) {
    newCount.textContent = newOrders.length;
  }

  if (prepCount) {
    prepCount.textContent = preparingOrders.length;
  }

  if (readyCount) {
    readyCount.textContent = readyOrders.length;
  }

  if (!ordersElement) {
    return;
  }

  if (!activeOrders.length) {
    ordersElement.innerHTML = `
      <div class="order">
        <strong>Aktif sipariş yok.</strong>
      </div>
    `;

    return;
  }

  ordersElement.innerHTML =
    activeOrders.map(orderHTML).join("");
}

function orderHTML(order) {
  const items = (order.order_items || [])
    .map(item => {
      const itemTotal =
        Number(item.quantity || 0) *
        Number(item.unit_price || 0);

      return `
        <div class="item">

          <div class="item-top">
            <span>
              ${item.quantity} ×
              ${esc(item.product_name)}
            </span>

            <span>
              ₺${itemTotal.toFixed(2)}
            </span>
          </div>

          ${
            item.note
              ? `
                <div class="note">
                  Not: ${esc(item.note)}
                </div>
              `
              : ""
          }

        </div>
      `;
    })
    .join("");

  const statusNames = {
    new: "Yeni",
    preparing: "Hazırlanıyor",
    ready: "Hazır",
    completed: "Tamamlandı"
  };

  const statusName =
    statusNames[order.status] || order.status;

  const time = order.created_at
    ? new Date(order.created_at).toLocaleTimeString(
        "tr-TR",
        {
          hour: "2-digit",
          minute: "2-digit"
        }
      )
    : "";

  return `
    <article class="order ${
      order.status === "new" ? "new" : ""
    }">

      <div class="order-head">

        <div class="table">
          Masa ${esc(order.table_number)}
        </div>

        <div class="time">
          ${time}
        </div>

      </div>

      <div class="status ${esc(order.status)}">
        ${esc(statusName)}
      </div>

      ${items}

      ${
        order.customer_note
          ? `
            <div class="customer-note">
              <strong>Sipariş notu:</strong>
              ${esc(order.customer_note)}
            </div>
          `
          : ""
      }

      <div class="actions">
        ${buttons(order)}
      </div>

    </article>
  `;
}

function buttons(order) {
  if (order.status === "new") {
    return `
      <button
        onclick="setStatus('${escAttr(order.id)}','preparing')"
      >
        Hazırlamaya Al
      </button>
    `;
  }

  if (order.status === "preparing") {
    return `
      <button
        onclick="setStatus('${escAttr(order.id)}','ready')"
      >
        Hazır
      </button>
    `;
  }

  if (order.status === "ready") {
    return `
      <button
        onclick="setStatus('${escAttr(order.id)}','completed')"
      >
        Tamamlandı
      </button>
    `;
  }

  return "";
}

async function setStatus(id, status) {
  const { error } = await db
    .from("orders")
    .update({
      status
    })
    .eq("id", id);

  if (error) {
    console.error("STATUS ERROR:", error);

    alert(
      "Durum değiştirilemedi: " +
      error.message
    );

    return;
  }

  await loadOrders();
}

function showLoginError(message) {
  const element =
    document.getElementById("loginError");

  if (element) {
    element.textContent = message || "";
  }
}

function esc(value) {
  return String(value ?? "").replace(
    /[&<>"']/g,
    character => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[character]
  );
}

function escAttr(value) {
  return esc(value);
}

async function enableNotifications() {
  if (!("Notification" in window)) {
    alert("Bu cihaz bildirimleri desteklemiyor.");
    return;
  }

  if (!("serviceWorker" in navigator)) {
    alert("Service Worker desteklenmiyor.");
    return;
  }

  try {
    const permission =
      await Notification.requestPermission();

    if (permission !== "granted") {
      alert("Bildirim izni verilmedi.");
      return;
    }

    const registration =
      await navigator.serviceWorker.register(
        "./service-worker.js"
      );

    const publicKey =
      "BPsCSbvdu2cl_jaRVXQ9K3zN7AN_4V6iBCRhu1MZIgFbHXfOFMCYlcYFDLGeXhm1XoHTglW20HR_uXLTE7KLR_g";

    let subscription =
      await registration.pushManager.getSubscription();

    if (!subscription) {
      subscription =
        await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey:
            urlBase64ToUint8Array(publicKey)
        });
    }

    const {
      data: { user }
    } = await db.auth.getUser();

    if (!user) {
      alert("Önce admin hesabıyla giriş yap.");
      return;
    }

    const json = subscription.toJSON();

    if (!json.endpoint || !json.keys) {
      throw new Error(
        "Push aboneliği bilgileri alınamadı."
      );
    }

    const { error } =
      await db
        .from("push_subscriptions")
        .upsert(
          {
            user_id: user.id,
            endpoint: json.endpoint,
            p256dh: json.keys.p256dh,
            auth: json.keys.auth
          },
          {
            onConflict: "endpoint"
          }
        );

    if (error) {
      console.error(
        "PUSH DATABASE ERROR:",
        error
      );

      alert(
        "Bildirim kaydedilemedi: " +
        error.message
      );

      return;
    }

    const button =
      document.getElementById(
        "enableNotifications"
      );

    if (button) {
      button.textContent =
        "🔔 Bildirimler Açık";

      button.disabled = true;
    }

    alert(
      "Bildirimler başarıyla açıldı!"
    );

  } catch (error) {
    console.error(
      "PUSH ERROR:",
      error
    );

    alert(
      "Bildirim kurulamadı: " +
      error.message
    );
  }
}

function urlBase64ToUint8Array(
  base64String
) {
  const padding =
    "=".repeat(
      (4 -
        (base64String.length % 4)) %
        4
    );

  const base64 =
    (base64String + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/");

  const rawData =
    window.atob(base64);

  return Uint8Array.from(
    [...rawData].map(
      char =>
        char.charCodeAt(0)
    )
  );
}
