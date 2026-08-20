const SUPABASE_URL =
  "https://dppqwqsawarkyzzonzyu.supabase.co";

const SUPABASE_ANON_KEY =
  "sb_publishable_fhNovHoi8Xgh1jScRsdrgQ_ZCe6I4tP";

const db = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);


/* =========================
   CUSTOMER ID
========================= */

function getCustomerId() {

  let customerId =
    localStorage.getItem(
      "mrx_customer_id"
    );

  if (!customerId) {

    if (
      window.crypto &&
      crypto.randomUUID
    ) {
      customerId =
        crypto.randomUUID();
    } else {

      customerId =
        "customer-" +
        Date.now() +
        "-" +
        Math.random()
          .toString(36)
          .substring(2);
    }

    localStorage.setItem(
      "mrx_customer_id",
      customerId
    );
  }

  return customerId;
}

const customerId =
  getCustomerId();


/* =========================
   TABLE
========================= */

const params =
  new URLSearchParams(
    window.location.search
  );

const tableNumber =
  params.get("table");


/* =========================
   STATE
========================= */

let products = [];
let cart = [];


/* =========================
   INIT
========================= */

document.addEventListener(
  "DOMContentLoaded",
  init
);


async function init() {

  console.log(
    "APP JS BAŞLADI"
  );

  console.log(
    "CUSTOMER ID:",
    customerId
  );


  if (!tableNumber) {

    showNotice(
      "Masa bilgisi bulunamadı. Lütfen masadaki QR kodu okutun."
    );

    return;
  }


  const tableBadge =
    document.getElementById(
      "tableBadge"
    );


  if (tableBadge) {

    tableBadge.textContent =
      `Masa ${tableNumber}`;

  }


  await loadRestaurant();

  await loadProducts();

  renderCategories();

  renderMenu();

  renderCart();

  updateOrderHistoryButton();
}


/* =========================
   RESTAURANT
========================= */

async function loadRestaurant() {

  const {
    data,
    error
  } = await db
    .from(
      "restaurant_settings"
    )
    .select("name")
    .limit(1)
    .maybeSingle();


  if (error) {

    console.error(
      "RESTAURANT ERROR:",
      error
    );

    return;
  }


  if (
    data &&
    data.name
  ) {

    const restaurantName =
      document.getElementById(
        "restaurantName"
      );


    if (restaurantName) {

      restaurantName.textContent =
        data.name;

    }

  }

}


/* =========================
   PRODUCTS
========================= */

async function loadProducts() {

  console.log(
    "ÜRÜNLER YÜKLENİYOR..."
  );


  const {
    data,
    error
  } = await db
    .from("products")
    .select(
      "id, name, description, category, price, is_active, sort_order"
    )
    .eq(
      "is_active",
      true
    )
    .order(
      "sort_order",
      {
        ascending: true
      }
    );


  if (error) {

    console.error(
      "PRODUCTS ERROR:",
      error
    );


    showNotice(
      "Menü yüklenemedi: " +
      error.message
    );


    products = [];

    return;
  }


  products =
    Array.isArray(data)
      ? data
      : [];


  if (
    products.length === 0
  ) {

    showNotice(
      "Aktif ürün bulunamadı."
    );

  }

}


/* =========================
   CATEGORIES
========================= */

function categories() {

  return [
    ...new Set(
      products
        .map(
          product =>
            product.category
        )
        .filter(Boolean)
    )
  ];

}


function renderCategories() {

  const element =
    document.getElementById(
      "categories"
    );


  if (!element) {
    return;
  }


  const categoryList =
    categories();


  element.innerHTML =
    categoryList
      .map(
        (
          category,
          index
        ) => `

          <button
            class="category ${
              index === 0
                ? "active"
                : ""
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


/* =========================
   MENU
========================= */

function renderMenu() {

  const menu =
    document.getElementById(
      "menu"
    );


  if (!menu) {
    return;
  }


  if (!products.length) {

    menu.innerHTML = `
      <div>
        <strong>
          Menüde ürün bulunamadı.
        </strong>
      </div>
    `;

    return;
  }


  const categoryList =
    categories();


  menu.innerHTML =
    categoryList
      .map(
        category => {

          const categoryProducts =
            products.filter(
              product =>
                product.category ===
                category
            );


          return `

            <section
              id="cat-${slug(category)}"
            >

              <h2
                class="category-title"
              >
                ${esc(category)}
              </h2>

              ${categoryProducts
                .map(productHTML)
                .join("")}

            </section>

          `;

        }
      )
      .join("");

}


/* =========================
   PRODUCT
========================= */

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


/* =========================
   CART
========================= */

function addToCart(id) {

  const product =
    products.find(
      product =>
        String(product.id) ===
        String(id)
    );


  if (!product) {
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

      id:
        product.id,

      name:
        product.name,

      price:
        Number(
          product.price || 0
        ),

      qty:
        1,

      note:
        ""

    });

  }


  renderCart();

  openCart();

}


function changeQty(
  id,
  amount
) {

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

    cart =
      cart.filter(
        item =>
          String(item.id) !==
          String(id)
      );

  }


  renderCart();

}


function updateItemNote(
  id,
  value
) {

  const item =
    cart.find(
      item =>
        String(item.id) ===
        String(id)
    );


  if (item) {

    item.note =
      value;

  }

}


/* =========================
   RENDER CART
========================= */

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


/* =========================
   PLACE ORDER
========================= */

async function placeOrder() {

  if (!cart.length) {

    alert(
      "Sepet boş."
    );

    return;
  }


  const button =
    document.querySelector(
      ".primary"
    );


  if (button) {

    button.disabled =
      true;

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


  /* =========================
     CREATE ORDER
  ========================= */

  const {
    data: order,
    error
  } = await db
    .from("orders")
    .insert({

      table_number:
        String(tableNumber),

      status:
        "new",

      total:
        total,

      customer_note:
        customerNote || null,

      customer_id:
        customerId

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

      button.disabled =
        false;

      button.textContent =
        "Siparişi Gönder";

    }


    return;
  }


  /* =========================
     ORDER ITEMS
  ========================= */

  const orderItems =
    cart.map(
      item => ({

        order_id:
          order.id,

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

      })
    );


  const {
    error: itemsError
  } = await db
    .from("order_items")
    .insert(
      orderItems
    );


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

      button.disabled =
        false;

      button.textContent =
        "Siparişi Gönder";

    }


    return;
  }


  /* =========================
     CLEAN CART
  ========================= */

  cart = [];


  if (noteElement) {

    noteElement.value =
      "";

  }


  renderCart();

  closeCart();


  showNotice(
    `Siparişiniz alındı. Masa ${tableNumber}.`
  );


  if (button) {

    button.disabled =
      false;

    button.textContent =
      "Siparişi Gönder";

  }


  updateOrderHistoryButton();

}


/* =========================
   MY ORDERS
========================= */

async function loadMyOrders() {

  const container =
    document.getElementById(
      "myOrders"
    );


  if (!container) {
    return;
  }


  container.innerHTML = `
    <p>
      Siparişler yükleniyor...
    </p>
  `;


  const {
    data,
    error
  } = await db
    .from("orders")
    .select(`
      id,
      created_at,
      status,
      total,
      table_number,
      customer_note,
      order_items (
        product_name,
        quantity,
        unit_price,
        note
      )
    `)
    .eq(
      "customer_id",
      customerId
    )
    .order(
      "created_at",
      {
        ascending:
          false
      }
    );


  if (error) {

    console.error(
      "MY ORDERS ERROR:",
      error
    );


    container.innerHTML = `
      <p>
        Sipariş geçmişi yüklenemedi.
      </p>
    `;

    return;
  }


  if (!data || !data.length) {

    container.innerHTML = `
      <div class="my-orders-empty">

        <strong>
          Henüz siparişiniz yok.
        </strong>

        <p>
          Verdiğiniz siparişler burada görünecek.
        </p>

      </div>
    `;

    return;
  }


  let grandTotal = 0;


  container.innerHTML =
    data
      .map(order => {

        const total =
          Number(
            order.total || 0
          );


        grandTotal +=
          total;


        const date =
          new Date(
            order.created_at
          );


        const time =
          date.toLocaleTimeString(
            "tr-TR",
            {
              hour:
                "2-digit",
              minute:
                "2-digit"
            }
          );


        const statusNames = {

          new:
            "Yeni",

          preparing:
            "Hazırlanıyor",

          ready:
            "Hazır",

          completed:
            "Tamamlandı"

        };


        const statusName =
          statusNames[
            order.status
          ] ||
          order.status;


        const items =
          (
            order.order_items ||
            []
          )
            .map(
              item => `

                <div class="my-order-item">

                  <span>
                    ${item.quantity} ×
                    ${esc(
                      item.product_name
                    )}
                  </span>

                  <strong>
                    ₺${(
                      Number(
                        item.unit_price ||
                        0
                      ) *
                      Number(
                        item.quantity ||
                        0
                      )
                    ).toFixed(2)}
                  </strong>

                </div>

              `
            )
            .join("");


        return `

          <article class="my-order">

            <div class="my-order-head">

              <strong>
                Sipariş
              </strong>

              <span>
                ${time}
              </span>

            </div>


            <div class="my-order-status ${esc(
              order.status
            )}">

              ${esc(
                statusName
              )}

            </div>


            <div class="my-order-items">

              ${items}

            </div>


            <div class="my-order-total">

              <span>
                Toplam
              </span>

              <strong>
                ₺${total.toFixed(2)}
              </strong>

            </div>

          </article>

        `;

      })
      .join("");


  const totalElement =
    document.getElementById(
      "myOrdersTotal"
    );


  if (totalElement) {

    totalElement.textContent =
      "₺" +
      grandTotal.toFixed(2);

  }

}


/* =========================
   ORDER HISTORY MODAL
========================= */

function openMyOrders() {

  const modal =
    document.getElementById(
      "myOrdersModal"
    );


  if (!modal) {
    return;
  }


  modal.classList.remove(
    "hidden"
  );


  loadMyOrders();

}


function closeMyOrders() {

  const modal =
    document.getElementById(
      "myOrdersModal"
    );


  if (!modal) {
    return;
  }


  modal.classList.add(
    "hidden"
  );

}


/* =========================
   HISTORY BUTTON
========================= */

function updateOrderHistoryButton() {

  const button =
    document.getElementById(
      "myOrdersButton"
    );


  if (button) {

    button.style.display =
      "block";

  }

}


/* =========================
   CART
========================= */

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


/* =========================
   CATEGORY SCROLL
========================= */

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
      behavior:
        "smooth",

      block:
        "start"
    });

  }

}


/* =========================
   NOTICE
========================= */

function showNotice(text) {

  const notice =
    document.getElementById(
      "notice"
    );


  if (!notice) {
    return;
  }


  notice.textContent =
    text;


  notice.classList.remove(
    "hidden"
  );

}


/* =========================
   HELPERS
========================= */

function slug(text) {

  return String(
    text || ""
  )
    .toLowerCase()
    .replace(
      /[^a-z0-9çğıöşü]+/g,
      "-"
    );

}


function esc(text) {

  return String(
    text ?? ""
  ).replace(
    /[&<>"']/g,
    character => ({

      "&":
        "&amp;",

      "<":
        "&lt;",

      ">":
        "&gt;",

      '"':
        "&quot;",

      "'":
        "&#39;"

    })[character]
  );

}


function escAttr(text) {

  return esc(text);

}
