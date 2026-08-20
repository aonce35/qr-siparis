const SUPABASE_URL =
  "https://dppqwqsawarkyzzonzyu.supabase.co";

const SUPABASE_ANON_KEY =
  "sb_publishable_fhNovHoi8Xgh1jScRsdrgQ_ZCe6I4tP";

const db = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

let orders = [];
let realtimeStarted = false;

document.addEventListener(
  "DOMContentLoaded",
  init
);

async function init() {
  console.log("ADMIN APP BAŞLADI");

  try {
    const {
      data: { session },
      error
    } = await db.auth.getSession();

    if (error) {
      console.error("SESSION ERROR:", error);
      showLoginError(
        "Oturum kontrolü başarısız: " +
        error.message
      );
      return;
    }

    if (session) {
      await showApp();
    }
  } catch (error) {
    console.error(
      "SESSION NETWORK ERROR:",
      error
    );

    showLoginError(
      "Bağlantı hatası: " +
      (error.message || "Load failed")
    );
  }
}


/* LOGIN */

async function login() {
  const email =
    document
      .getElementById("email")
      .value
      .trim();

  const password =
    document
      .getElementById("password")
      .value;

  if (!email || !password) {
    showLoginError(
      "E-posta ve şifre gerekli."
    );
    return;
  }

  showLoginError("");

  const button =
    document.querySelector(
      "#loginView button"
    );

  if (button) {
    button.disabled = true;
    button.textContent =
      "Giriş yapılıyor...";
  }

  try {
    console.log(
      "DİREKT SUPABASE AUTH TESTİ"
    );

    const response =
      await fetch(
        SUPABASE_URL +
        "/auth/v1/token?grant_type=password",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            "apikey":
              SUPABASE_ANON_KEY
          },

          body: JSON.stringify({
            email: email,
            password: password
          })
        }
      );

    const text =
      await response.text();

    console.log(
      "AUTH STATUS:",
      response.status
    );

    console.log(
      "AUTH RESPONSE:",
      text
    );

    if (!response.ok) {
      let message = text;

      try {
        const json =
          JSON.parse(text);

        message =
          json.msg ||
          json.message ||
          json.error_description ||
          json.error ||
          text;

      } catch (e) {}

      showLoginError(
        "Giriş başarısız: " +
        message
      );

      if (button) {
        button.disabled = false;
        button.textContent =
          "Giriş Yap";
      }

      return;
    }

    const session =
      JSON.parse(text);

    console.log(
      "AUTH BAŞARILI"
    );

    if (!session.access_token) {
      showLoginError(
        "Giriş yapıldı ama session alınamadı."
      );

      if (button) {
        button.disabled = false;
        button.textContent =
          "Giriş Yap";
      }

      return;
    }

    const {
      error: sessionError
    } = await db.auth.setSession({
      access_token:
        session.access_token,

      refresh_token:
        session.refresh_token
    });

    if (sessionError) {
      console.error(
        "SESSION SET ERROR:",
        sessionError
      );

      showLoginError(
        "Session hatası: " +
        sessionError.message
      );

      if (button) {
        button.disabled = false;
        button.textContent =
          "Giriş Yap";
      }

      return;
    }

    console.log(
      "SESSION BAŞARILI"
    );

    await showApp();

  } catch (error) {
    console.error(
      "AUTH NETWORK ERROR:",
      error
    );

    showLoginError(
      "Bağlantı hatası: " +
      (
        error.message ||
        "Load failed"
      )
    );

    if (button) {
      button.disabled = false;
      button.textContent =
        "Giriş Yap";
    }
  }
}


/* LOGOUT */

async function logout() {
  await db.auth.signOut();
  location.reload();
}


/* APP */

async function showApp() {
  const loginView =
    document.getElementById(
      "loginView"
    );

  const appView =
    document.getElementById(
      "appView"
    );

  if (loginView) {
    loginView.classList.add(
      "hidden"
    );
  }

  if (appView) {
    appView.classList.remove(
      "hidden"
    );
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


/* ORDERS */

async function loadOrders() {
  console.log(
    "SİPARİŞLER YÜKLENİYOR..."
  );

  const { data, error } =
    await db
      .from("orders")
      .select(`
        *,
        order_items (*)
      `)
      .order(
        "created_at",
        {
          ascending: false
        }
      );

  if (error) {
    console.error(
      "ORDERS ERROR:",
      error
    );

    const ordersElement =
      document.getElementById(
        "orders"
      );

    if (ordersElement) {
      ordersElement.innerHTML = `
        <div class="order">
          <strong>
            Siparişler yüklenemedi.
          </strong>

          <p>
            ${esc(error.message)}
          </p>
        </div>
      `;
    }

    return;
  }

  orders = data || [];

  render();
}


/* RENDER */

function render() {
  const newOrders =
    orders.filter(
      order =>
        order.status === "new"
    );

  const preparingOrders =
    orders.filter(
      order =>
        order.status === "preparing"
    );

  const readyOrders =
    orders.filter(
      order =>
        order.status === "ready"
    );

  const activeOrders =
    orders.filter(
      order =>
        order.status !==
        "completed"
    );

  const newCount =
    document.getElementById(
      "newCount"
    );

  const prepCount =
    document.getElementById(
      "prepCount"
    );

  const readyCount =
    document.getElementById(
      "readyCount"
    );

  const ordersElement =
    document.getElementById(
      "orders"
    );

  if (newCount) {
    newCount.textContent =
      newOrders.length;
  }

  if (prepCount) {
    prepCount.textContent =
      preparingOrders.length;
  }

  if (readyCount) {
    readyCount.textContent =
      readyOrders.length;
  }

  if (!ordersElement) {
    return;
  }

  if (!activeOrders.length) {
    ordersElement.innerHTML = `
      <div class="order">
        <strong>
          Aktif sipariş yok.
        </strong>
      </div>
    `;

    return;
  }

  ordersElement.innerHTML =
    activeOrders
      .map(orderHTML)
      .join("");
}


/* ORDER */

function orderHTML(order) {
  const items =
    (order.order_items || [])
      .map(item => {
        const itemTotal =
          Number(
            item.quantity || 0
          ) *
          Number(
            item.unit_price || 0
          );

        return `
          <div class="item">

            <div class="item-top">
              <span>
                ${item.quantity} ×
                ${esc(
                  item.product_name
                )}
              </span>

              <span>
                ₺${itemTotal.toFixed(2)}
              </span>
            </div>

            ${
              item.note
                ? `
                  <div class="note">
                    Not:
                    ${esc(item.note)}
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
    preparing:
      "Hazırlanıyor",
    ready: "Hazır",
    completed:
      "Tamamlandı"
  };

  const statusName =
    statusNames[order.status] ||
    order.status;

  const time =
    order.created_at
      ? new Date(
          order.created_at
        ).toLocaleTimeString(
          "tr-TR",
          {
            hour: "2-digit",
            minute: "2-digit"
          }
        )
      : "";

  return `
    <article
      class="order ${
        order.status === "new"
          ? "new"
          : ""
      }"
    >

      <div class="order-head">

        <div class="table">
          Masa
          ${esc(
            order.table_number
          )}
        </div>

        <div class="time">
          ${time}
        </div>

      </div>

      <div
        class="status ${esc(
          order.status
        )}"
      >
        ${esc(statusName)}
      </div>

      ${items}

      ${
        order.customer_note
          ? `
            <div class="customer-note">
              <strong>
                Sipariş notu:
              </strong>

              ${esc(
                order.customer_note
              )}
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


/* BUTTONS */

function buttons(order) {
  if (order.status === "new") {
    return `
      <button
        onclick="setStatus(
          '${escAttr(order.id)}',
          'preparing'
        )"
      >
        Hazırlamaya Al
      </button>
    `;
  }

  if (
    order.status ===
    "preparing"
  ) {
    return `
      <button
        onclick="setStatus(
          '${escAttr(order.id)}',
          'ready'
        )"
      >
        Hazır
      </button>
    `;
  }

  if (order.status === "ready") {
    return `
      <button
        onclick="setStatus(
          '${escAttr(order.id)}',
          'completed'
        )"
      >
        Tamamlandı
      </button>
    `;
  }

  return "";
}


/* STATUS */

async function setStatus(
  id,
  status
) {
  const { error } =
    await db
      .from("orders")
      .update({
        status
      })
      .eq(
        "id",
        id
      );

  if (error) {
    console.error(
      "STATUS ERROR:",
      error
    );

    alert(
      "Durum değiştirilemedi: " +
      error.message
    );

    return;
  }

  await loadOrders();
}


/* ERROR */

function showLoginError(
  message
) {
  const element =
    document.getElementById(
      "loginError"
    );

  if (element) {
    element.textContent =
      message || "";
  }
}


/* ESCAPE */

function esc(value) {
  return String(
    value ?? ""
  ).replace(
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
