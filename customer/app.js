const SUPABASE_URL = "https://dppqwqsawarkyzzonzyu.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_fhNovHoi8Xgh1jScRsdrgQ_ZCe6I4tP";

const db = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

const params = new URLSearchParams(window.location.search);
const tableNumber = params.get("table");

let products = [];
let cart = [];

document.addEventListener("DOMContentLoaded", init);

async function init() {
  console.log("APP JS BAŞLADI");

  if (!tableNumber) {
    showNotice(
      "Masa bilgisi bulunamadı. Lütfen masadaki QR kodu okutun."
    );
    return;
  }

  const tableBadge = document.getElementById("tableBadge");

  if (tableBadge) {
    tableBadge.textContent = `Masa ${tableNumber}`;
  }

  await loadRestaurant();
  await loadProducts();

  renderCategories();
  renderMenu();
  renderCart();
}

async function loadRestaurant() {
  const { data, error } = await db
    .from("restaurant_settings")
    .select("name")
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("RESTAURANT ERROR:", error);
    return;
  }

  if (data && data.name) {
    const restaurantName =
      document.getElementById("restaurantName");

    if (restaurantName) {
      restaurantName.textContent = data.name;
    }
  }
}

async function loadProducts() {
  console.log("ÜRÜNLER YÜKLENİYOR...");

  const { data, error } = await db
    .from("products")
    .select(
      "id, name, description, category, price, is_active, sort_order"
    )
    .eq("is_active", true)
    .order("sort_order", {
      ascending: true
    });

  if (error) {
    console.error("PRODUCTS ERROR:", error);

    showNotice(
      "Menü yüklenemedi: " + error.message
    );

    products = [];
    return;
  }

  console.log("SUPABASE ÜRÜNLER:", data);

  products = Array.isArray(data)
    ? data
    : [];

  if (products.length === 0) {
    showNotice("Aktif ürün bulunamadı.");
  }
}

function categories() {
  return [
    ...new Set(
      products
        .map(product => product.category)
        .filter(Boolean)
    )
  ];
}

function renderCategories() {
  const element =
    document.getElementById("categories");

  if (!element) {
    console.error(
      "categories elementi bulunamadı."
    );
    return;
  }

  const categoryList = categories();

  element.innerHTML = categoryList
    .map(
      (category, index) => `
        <button
          class="category ${
            index === 0 ? "active" : ""
          }"
          onclick="scrollToCategory('${escAttr(
            category
          )}')"
        >
          ${esc(category)}
        </button>
      `
    )
    .join("");
}

function renderMenu() {
  const menu =
    document.getElementById("menu");

  if (!menu) {
    console.error(
      "menu elementi bulunamadı."
    );
    return;
  }

  if (!products.length) {
    menu.innerHTML = `
      <div style="
        background:#fff;
        padding:20px;
        border-radius:15px;
        margin-top:20px;
      ">
        <strong>Menüde ürün bulunamadı.</strong>
      </div>
    `;
    return;
  }

  const categoryList = categories();

  menu.innerHTML = categoryList
    .map(category => {
      const categoryProducts =
        products.filter(
          product =>
            product.category === category
        );

      return `
        <section id="cat-${slug(category)}">

          <h2 class="category-title">
            ${esc(category)}
          </h2>

          ${categoryProducts
            .map(productHTML)
            .join("")}

        </section>
      `;
    })
    .join("");
}

function productHTML(product) {
  return `
    <article class="product">

      <div class="product-info">

        <h3>
          ${esc(product.name)}
        </h3>

        <p>
          ${esc(
            product.description || ""
          )}
        </p>

        <div class="price">
          ₺${Number(
            product.price || 0
          ).toFixed(2)}
        </div>

      </div>

      <button
        class="add"
        onclick="addToCart('${escAttr(
          product.id
        )}')"
      >
        Ekle
      </button>

    </article>
  `;
}

function addToCart(id) {
  const product =
    products.find(
      product =>
        String(product.id) ===
        String(id)
    );

  if (!product) {
    console.error(
      "Ürün bulunamadı:",
      id
    );
    return;
  }

  const existing =
    cart.find(
      item =>
        String(item.id) ===
        String(id)
    );

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: Number(product.price || 0),
      qty: 1,
      note: ""
    });
  }

  renderCart();
  openCart();
}

function changeQty(id, amount) {
  const item =
    cart.find(
      item =>
        String(item.id) ===
        String(id)
    );

  if (!item) {
    return;
  }

  item.qty += amount;

  if (item.qty <= 0) {
    cart = cart.filter(
      item =>
        String(item.id) !==
        String(id)
    );
  }

  renderCart();
}

function updateItemNote(id, value) {
  const item =
    cart.find(
      item =>
        String(item.id) ===
        String(id)
    );

  if (item) {
    item.note = value;
  }
}

function renderCart() {
  const cartCount =
    document.getElementById(
      "cartCount"
    );

  const cartTotal =
    document.getElementById(
      "cartTotal"
    );

  const cartItems =
    document.getElementById(
      "cartItems"
    );

  if (
    !cartCount ||
    !cartTotal ||
    !cartItems
  ) {
    return;
  }

  const count =
    cart.reduce(
      (total, item) =>
        total + item.qty,
      0
    );

  const total =
    cart.reduce(
      (sum, item) =>
        sum +
        item.price *
          item.qty,
      0
    );

  cartCount.textContent =
    count;

  cartTotal.textContent =
    "₺" +
    total.toFixed(2);

  if (!cart.length) {
    cartItems.innerHTML =
      "<p>Sepet boş.</p>";

    return;
  }

  cartItems.innerHTML =
    cart
      .map(
        item => `
          <div class="cart-row">

            <div class="cart-main">

              <strong>
                ${esc(item.name)}
              </strong>

              <strong>
                ₺${(
                  item.price *
                  item.qty
                ).toFixed(2)}
              </strong>

            </div>

            <div class="qty">

              <button
                onclick="changeQty(
                  '${escAttr(item.id)}',
                  -1
                )"
              >
                −
              </button>

              <span>
                ${item.qty}
              </span>

              <button
                onclick="changeQty(
                  '${escAttr(item.id)}',
                  1
                )"
              >
                +
              </button>

            </div>

            <input
              class="item-note"
              value="${escAttr(
                item.note
              )}"
              placeholder="Bu ürün için not..."
              oninput="updateItemNote(
                '${escAttr(item.id)}',
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
    document.querySelector(
      ".primary"
    );

  if (button) {
    button.disabled = true;
    button.textContent =
      "Gönderiliyor...";
  }

  const total =
    cart.reduce(
      (sum, item) =>
        sum +
        item.price *
          item.qty,
      0
    );

  const noteElement =
    document.getElementById(
      "orderNote"
    );

  const customerNote =
    noteElement
      ? noteElement.value.trim()
      : "";

  const {
    data: order,
    error
  } = await db
    .from("orders")
    .insert({
      table_number:
        String(tableNumber),

      status: "new",

      total: total,

      customer_note:
        customerNote || null
    })
    .select()
    .single();

  if (error) {
    console.error(
      "ORDER ERROR:",
      error
    );

    alert(
      "Sipariş gönderilemedi: " +
        error.message
    );

    if (button) {
      button.disabled = false;
      button.textContent =
        "Siparişi Gönder";
    }

    return;
  }

  const orderItems =
    cart.map(item => ({
      order_id: order.id,

      product_id:
        item.id,

      product_name:
        item.name,

      quantity:
        item.qty,

      unit_price:
        item.price,

      note:
        item.note || null
    }));

  const {
    error: itemsError
  } = await db
    .from("order_items")
    .insert(orderItems);

  if (itemsError) {
    console.error(
      "ORDER ITEMS ERROR:",
      itemsError
    );

    alert(
      "Sipariş ürünleri kaydedilemedi: " +
        itemsError.message
    );

    if (button) {
      button.disabled = false;
      button.textContent =
        "Siparişi Gönder";
    }

    return;
  }

  cart = [];

  if (noteElement) {
    noteElement.value = "";
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
    document.getElementById(
      "cartModal"
    );

  if (!modal) {
    return;
  }

  modal.classList.remove(
    "hidden"
  );

  renderCart();
}

function closeCart() {
  const modal =
    document.getElementById(
      "cartModal"
    );

  if (!modal) {
    return;
  }

  modal.classList.add(
    "hidden"
  );
}

function scrollToCategory(
  category
) {
  const element =
    document.getElementById(
      "cat-" +
        slug(category)
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
    document.getElementById(
      "notice"
    );

  if (!notice) {
    return;
  }

  notice.textContent = text;

  notice.classList.remove(
    "hidden"
  );
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
      character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      })[character]
    );
}

function escAttr(text) {
  return esc(text);
}
