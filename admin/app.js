const SUPABASE_URL = "https://dppqwgsawarkyzzonzyu.supabase.co";

const SUPABASE_ANON_KEY =
  "sb_publishable_fhNovHoi8Xgh1jScRsdrgQ_ZCe6I4tP";

const db = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

let orders = [];

document.addEventListener("DOMContentLoaded", init);

async function init() {
  console.log("ADMIN APP BAŞLADI");

  const {
    data: { session },
    error
  } = await db.auth.getSession();

  if (error) {
    console.error("SESSION ERROR:", error);
    return;
  }

  if (session) {
    showApp();
  }
}

async function login() {
  const emailElement =
    document.getElementById("email");

  const passwordElement =
    document.getElementById("password");

  const errorElement =
    document.getElementById("loginError");

  const email =
    emailElement.value.trim();

  const password =
    passwordElement.value;

  errorElement.textContent = "";

  if (!email || !password) {
    errorElement.textContent =
      "E-posta ve şifre gerekli.";
    return;
  }

  const { data, error } =
    await db.auth.signInWithPassword({
      email,
      password
    });

  if (error) {
    console.error("LOGIN ERROR:", error);

    errorElement.textContent =
      "Giriş başarısız: " +
      error.message;

    return;
  }

  console.log("GİRİŞ BAŞARILI:", data.user);

  await showApp();
}

async function logout() {
  await db.auth.signOut();
  location.reload();
}

async function showApp() {
  const loginView =
    document.getElementById("loginView");

  const appView =
    document.getElementById("appView");

  if (loginView) {
    loginView.classList.add("hidden");
  }

  if (appView) {
    appView.classList.remove("hidden");
  }

  await loadOrders();

  db.channel("orders-live")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "orders"
      },
      () => {
        loadOrders();
      }
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
      () => {
        loadOrders();
      }
    )
    .subscribe();
}

async function loadOrders() {
  console.log("SİPARİŞLER YÜKLENİYOR...");

  const {
    data,
    error
  } = await db
    .from("orders")
    .select(`
      *,
      order_items(*)
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

  console.log(
    "YÜKLENEN SİPARİŞLER:",
    data
  );

  orders = data || [];

  render();
}

function render() {
  const activeOrders =
    orders.filter(
      order =>
        order.status !== "completed"
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
      orders.filter(
        order =>
          order.status === "new"
      ).length;
  }

  if (prepCount) {
    prepCount.textContent =
      orders.filter(
        order =>
          order.status === "preparing"
      ).length;
  }

  if (readyCount) {
    readyCount.textContent =
      orders.filter(
        order =>
          order.status === "ready"
      ).length;
  }

  if (!ordersElement) {
    console.error(
      "orders elementi bulunamadı."
    );
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
    activeOrders
      .map(orderHTML)
      .join("");
}

function orderHTML(order) {
  const items =
    (order.order_items || [])
      .map(
        item => `
          <div class="item">

            <div class="item-top">

              <span>
                ${item.quantity} ×
                ${esc(item.product_name)}
              </span>

              <span>
                ₺${(
                  Number(item.quantity) *
                  Number(item.unit_price)
                ).toFixed(2)}
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
        `
      )
      .join("");

  const statusNames = {
    new: "Yeni",
    preparing: "Hazırlanıyor",
    ready: "Hazır",
    completed: "Tamamlandı"
  };

  const statusName =
    statusNames[order.status] ||
    order.status;

  const createdAt =
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
          Masa ${esc(
            order.table_number
          )}
        </div>

        <div class="time">
          ${createdAt}
        </div>

      </div>

      <div class="status ${esc(
        order.status
      )}">
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
    order.status === "preparing"
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
      .eq("id", id);

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

function esc(value) {
  return String(
    value ?? ""
  ).replace(
    /[&<>"']/g,
    character =>
      ({
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
