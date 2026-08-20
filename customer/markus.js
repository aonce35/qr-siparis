const SUPABASE_URL = "https://dppqwqsawarkyzzonzyu.supabase.co";

const SUPABASE_ANON_KEY =
  "sb_publishable_fhNovHoi8Xgh1jScRsdrgQ_ZCe6I4tP";

const db = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);


const params =
  new URLSearchParams(
    window.location.search
  );

const tableNumber =
  params.get("table");


let products = [];
let cart = [];


document.addEventListener(
  "DOMContentLoaded",
  init
);


async function init() {

  console.log(
    "MARKUS SİSTEMİ BAŞLADI"
  );


  if (!tableNumber) {

    showNotice(
      "Masa bilgisi bulunamadı."
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

}


/* =========================
   RESTAURANT
========================= */

async function loadRestaurant() {

  const { data, error } =
    await db
      .from("restaurant_settings")
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

    const element =
      document.getElementById(
        "restaurantName"
      );


    if (element) {

      element.textContent =
        data.name;

    }

  }

}


/* =========================
   MARKUS PRODUCTS
========================= */

async function loadProducts() {

  console.log(
    "MARKUS ÜRÜNLERİ YÜKLENİYOR..."
  );


  const { data, error } =
    await db
      .from("products")
      .select(
        "id, name, description, category, price, is_active, sort_order"
      )
      .eq(
        "restaurant_slug",
        "markus"
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
      "MARKUS PRODUCTS ERROR:",
      error
    );

    showNotice(
      "Menü yüklenemedi: " +
      error.message
    );

    products = [];

    return;
  }


  console.log(
    "MARKUS ÜRÜNLERİ:",
    data
  );


  products =
    Array.isArray(data)
      ? data
      : [];


  if (
    products.length === 0
  ) {

    showNotice(
      "Markus menüsünde ürün bulunamadı."
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


/* =========================
   RENDER CATEGORIES
========================= */

function renderCategories() {

  const element =
    document.getElementById(
      "categories"
    );


  if (!element) {

    return;

  }


  const list =
    categories();


  element.innerHTML =
    list
      .map(
        (category, index) => `

          <button
            class="category ${
              index === 0
                ? "active"
                : ""
            }"
            onclick="scrollToCategory('${escAttr(category)}')"
          >

            ${esc(category)}

          </button>

        `
      )
      .join("");

}


/* =========================
   RENDER MENU
========================= */

function renderMenu() {

  const menu =
    document.getElementById(
      "menu"
    );


  if (!menu) {

    return;

  }


  if (
    !products.length
  ) {

    menu.innerHTML = `
      <div style="
        padding:20px;
        background:#fff;
        border-radius:15px;
      ">
        Menüde ürün bulunamadı.
      </div>
    `;

    return;

  }


  const list =
    categories();


  menu.innerHTML =
    list
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

              <h2 class="category-title">
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

function productHTML(
  product
) {

  return `

    <article class="product">

      <div class="product-info">

        <h3>
          ${esc(product.name)}
        </h3>

        ${
          product.description
            ? `
              <p>
                ${esc(
                  product.description
                )}
              </p>
            `
            : ""
        }


        <div class="price">

          ₺${Number(
            product.price || 0
          ).toFixed(2)}

        </div>

      </div>


      <button
        class="add"
        onclick="addToCart('${escAttr(product.id)}')"
      >
        Ekle
      </button>

    </article>

  `;

}


/* =========================
   CART
========================= */

function addToCart(
  id
) {

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


/* =========================
   QUANTITY
========================= */

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


  if (
    item.qty <= 0
  ) {

    cart =
      cart.filter(
        item =>
          String(item.id) !==
          String(id)
      );

  }


  renderCart();

}


/* =========================
   ITEM NOTE
========================= */

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
      (
        total,
        item
      ) =>
        total +
        item.qty,
      0
    );


  const total =
    cart.reduce(
      (
        sum,
        item
      ) =>
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


  if (
    !cart.length
  ) {

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
              value="${escAttr(item.note)}"
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
   SEND ORDER
========================= */

async function placeOrder() {

  if (
    !cart.length
  ) {

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
      (
        sum,
        item
      ) =>
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


  /* =====================
     ORDER
  ===================== */

  const {
    data: order,
    error
  } =
    await db
      .from("orders")
      .insert({

        table_number:
          String(
            tableNumber
          ),

        status:
          "new",

        total:
          total,

        customer_note:
          customerNote ||
          null

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


    resetOrderButton();

    return;

  }


  /* =====================
     ORDER ITEMS
  ===================== */

  const orderItems =
    cart.map(
      item => ({

        order_id:
          order.id,

        /* GERÇEK SUPABASE UUID */
        product_id:
          item.id,

        product_name:
          item.name,

        quantity:
          item.qty,

        unit_price:
          item.price,

        note:
          item.note ||
          null

      })
    );


  const {
    error: itemsError
  } =
    await db
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


    resetOrderButton();

    return;

  }


  /* =====================
     SUCCESS
  ===================== */

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


  resetOrderButton();

}


/* =========================
   RESET BUTTON
========================= */

function resetOrderButton() {

  const button =
    document.querySelector(
      ".primary"
    );


  if (button) {

    button.disabled =
      false;

    button.textContent =
      "Siparişi Gönder";

  }

}


/* =========================
   CART OPEN / CLOSE
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

function showNotice(
  text
) {

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

function slug(
  text
) {

  return String(
    text || ""
  )
    .toLowerCase()
    .replace(
      /[^a-z0-9çğıöşü]+/g,
      "-"
    );

}


function esc(
  text
) {

  return String(
    text ?? ""
  )
    .replace(
      /[&<>"']/g,
      character =>
        ({
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

        })[
          character
        ]
    );

}


function escAttr(
  text
) {

  return esc(
    text
  );

}
