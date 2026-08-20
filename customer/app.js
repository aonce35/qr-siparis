const SUPABASE_URL = "https://dppqwgsawarkyzzonzyu.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_fhNovHoi8Xgh1jScRsdrgQ_ZCe6I4tP";

const db = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

const params = new URLSearchParams(location.search);
const tableNumber = params.get("table");

let products = [];
let cart = [];

document.addEventListener("DOMContentLoaded", init);

async function init() {
  if (!tableNumber) {
    showNotice(
      "Masa bilgisi bulunamadı. Lütfen masadaki QR kodu okutun."
    );
    return;
  }

  document.getElementById("tableBadge").textContent =
    `Masa ${tableNumber}`;

  await loadRestaurant();
  await loadProducts();

  renderCategories();
  renderMenu();
  renderCart();
}

async function loadRestaurant() {
  const { data, error } = await db
    .from("restaurant_settings")
    .select("*")
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Restaurant error:", error);
    return;
  }

  if (data?.name) {
    document.getElementById("restaurantName").textContent =
      data.name;
  }
}

async function loadProducts() {
  const { data, error } = await db
    .from("products")
    .select("*")
    .order("sort_order");

  if (error) {
    console.error("Products error:", error);
    showNotice("Menü yüklenemedi.");
    return;
  }

  products = data || [];

  console.log("Yüklenen ürünler:", products);
}

function categories() {
  return [
    ...new Set(
      products
        .map(p => p.category)
        .filter(Boolean)
    )
  ];
}

function renderCategories() {
  const el = document.getElementById("categories");

  if (!el) return;

  el.innerHTML = categories()
    .map(
      (c, i) =>
        `<button
          class="category ${i === 0 ? "active" : ""}"
          onclick="scrollToCategory('${escAttr(c)}')"
        >
          ${esc(c)}
        </button>`
    )
    .join("");
}

function renderMenu() {
  const menu = document.getElementById("menu");

  if (!menu) return;

  if (!products.length) {
    menu.innerHTML =
      "<p>Henüz ürün bulunmuyor.</p>";
    return;
  }

  menu.innerHTML = categories()
    .map(
      c => `
        <section id="cat-${slug(c)}">
          <h2 class="category-title">
            ${esc(c)}
          </h2>

          ${products
            .filter(p => p.category === c)
            .map(productHTML)
            .join("")}
        </section>
      `
    )
    .join("");
}

function productHTML(p) {
  return `
    <article class="product">

      <div class="product-info">

        <h3>${esc(p.name)}</h3>

        <p>
          ${esc(p.description || "")}
        </p>

        <div class="price">
          ₺${Number(p.price || 0).toFixed(2)}
        </div>

      </div>

      <button
        class="add"
        onclick="addToCart('${escAttr(p.id)}')"
      >
        Ekle
      </button>

    </article>
  `;
}

function addToCart(id) {
  const p = products.find(
    x => String(x.id) === String(id)
  );

  if (!p) return;

  const existing = cart.find(
    x => String(x.id) === String(id)
  );

  if (existing) {
    existing.qty++;
  } else {
    cart.push({
      id: p.id,
      name: p.name,
      price: Number(p.price || 0),
      qty: 1,
      note: ""
    });
  }

  renderCart();
  openCart();
}

function changeQty(id, delta) {
  const item = cart.find(
    x => String(x.id) === String(id)
  );

  if (!item) return;

  item.qty += delta;

  if (item.qty <= 0) {
    cart = cart.filter(
      x => String(x.id) !== String(id)
    );
  }

  renderCart();
}

function updateItemNote(id, value) {
  const item = cart.find(
    x => String(x.id) === String(id)
  );

  if (item) {
    item.note = value;
  }
}

function renderCart() {
  const cartCount =
    document.getElementById("cartCount");

  const cartTotal =
    document.getElementById("cartTotal");

  const cartItems =
    document.getElementById("cartItems");

  if (!cartCount || !cartTotal || !cartItems) {
    return;
  }

  const count = cart.reduce(
    (sum, x) => sum + x.qty,
    0
  );

  const total = cart.reduce(
    (sum, x) => sum + x.price * x.qty,
    0
  );

  cartCount.textContent = count;

  cartTotal.textContent =
    "₺" + total.toFixed(2);

  if (!cart.length) {
    cartItems.innerHTML =
      "<p>Sepet boş.</p>";
    return;
  }

  cartItems.innerHTML = cart
    .map(
      x => `
        <div class="cart-row">

          <div class="cart-main">
            <strong>
              ${esc(x.name)}
            </strong>

            <strong>
              ₺${(x.price * x.qty).toFixed(2)}
            </strong>
          </div>

          <div class="qty">

            <button
              onclick="changeQty('${escAttr(x.id)}', -1)"
            >
              −
            </button>

            <span>
              ${x.qty}
            </span>

            <button
              onclick="changeQty('${escAttr(x.id)}', 1)"
            >
              +
            </button>

          </div>

          <input
            class="item-note"
            value="${escAttr(x.note)}"
            placeholder="Bu ürün için not..."
            oninput="updateItemNote(
              '${escAttr(x.id)}',
              this.value
            )"
          >

        </div>
      `
    )
    .join("");
}

async function placeOrder() {
  if (!cart.length) {
    alert("Sepet boş.");
    return;
  }

  const button =
    document.querySelector(".primary");

  if (button) {
    button.disabled = true;
    button.textContent = "Gönderiliyor...";
  }

  const total = cart.reduce(
    (sum, x) => sum + x.price * x.qty,
    0
  );

  const orderNoteElement =
    document.getElementById("orderNote");

  const orderNote =
    orderNoteElement
      ? orderNoteElement.value.trim()
      : "";

  const {
    data: order,
    error
  } = await db
    .from("orders")
    .insert({
      table_number: String(tableNumber),
      status: "new",
      total: total,
      customer_note: orderNote || null
    })
    .select()
    .single();

  if (error) {
    console.error("Order error:", error);

    alert("Sipariş gönderilemedi.");

    if (button) {
      button.disabled = false;
      button.textContent =
        "Siparişi Gönder";
    }

    return;
  }

  const items = cart.map(x => ({
    order_id: order.id,
    product_id: x.id,
    product_name: x.name,
    quantity: x.qty,
    unit_price: x.price,
    note: x.note || null
  }));

  const { error: itemError } =
    await db
      .from("order_items")
      .insert(items);

  if (itemError) {
    console.error(
      "Order items error:",
      itemError
    );

    alert(
      "Sipariş ürünleri kaydedilemedi."
    );

    if (button) {
      button.disabled = false;
      button.textContent =
        "Siparişi Gönder";
    }

    return;
  }

  cart = [];

  if (orderNoteElement) {
    orderNoteElement.value = "";
  }

  renderCart();
  closeCart();

  showNotice(
    `Siparişiniz alındı. Masa ${tableNumber}.`
  );

  if (button) {
    button.disabled = false;
    button.textContent =
      "Siparişi Gönder";
  }
}

function openCart() {
  const modal =
    document.getElementById("cartModal");

  if (!modal) return;

  modal.classList.remove("hidden");

  renderCart();
}

function closeCart() {
  const modal =
    document.getElementById("cartModal");

  if (!modal) return;

  modal.classList.add("hidden");
}

function scrollToCategory(category) {
  const element =
    document.getElementById(
      "cat-" + slug(category)
    );

  if (element) {
    element.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }
}

function showNotice(text) {
  const notice =
    document.getElementById("notice");

  if (!notice) return;

  notice.textContent = text;
  notice.classList.remove("hidden");
}

function slug(text) {
  return String(text || "")
    .toLowerCase()
    .replace(
      /[^a-z0-9çğıöşü]+/g,
      "-"
    );
}

function esc(text) {
  return String(text ?? "")
    .replace(
      /[&<>"']/g,
      m => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      }[m])
    );
}

function escAttr(text) {
  return esc(text);
}
