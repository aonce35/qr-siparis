const SUPABASE_URL =
  "https://dppqwqsawarkyzzonzyu.supabase.co";

const SUPABASE_ANON_KEY =
  "sb_publishable_fhNovHoi8Xgh1jScRsdrgQ_ZCe6I4tP";

const db = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);


/* =====================================
   MASA
===================================== */

const params =
  new URLSearchParams(
    window.location.search
  );

const tableNumber =
  params.get("table") || "1";


/* =====================================
   MARKUS MENÜSÜ
===================================== */

const products = [

  /* TOSTLAR */

  {
    id: "markus-tost-1",
    name: "Kaşarlı Tost",
    description:
      "Kaşar, domates, turşu",
    category: "Tostlar",
    price: 250
  },

  {
    id: "markus-tost-2",
    name: "Karışık Tost",
    description:
      "Sucuk, kaşar, domates, turşu",
    category: "Tostlar",
    price: 300
  },

  {
    id: "markus-tost-3",
    name: "Ayvalık Tostu",
    description:
      "Kaşar, sucuk, salam, sosis, domates, turşu",
    category: "Tostlar",
    price: 350
  },


  /* BURGERLER */

  {
    id: "markus-burger-1",
    name: "Hamburger",
    description:
      "125 Gr dana eti, marul, domates, turşu, özel sos",
    category: "Burgerler",
    price: 450
  },

  {
    id: "markus-burger-2",
    name: "Cheeseburger",
    description:
      "125 Gr dana eti, cheddar, marul, domates, turşu, özel sos",
    category: "Burgerler",
    price: 500
  },

  {
    id: "markus-burger-3",
    name: "Chicken Burger",
    description:
      "Çıtır tavuk, marul, domates, turşu, özel sos",
    category: "Burgerler",
    price: 400
  },


  /* KÖFTE & TAVUK */

  {
    id: "markus-kofte-1",
    name: "Köfte Porsiyon",
    description:
      "5 Adet El Yapımı Köfte, Salata, Patates, Közlenmiş Biber, Domates",
    category: "Köfte & Tavuk",
    price: 500
  },

  {
    id: "markus-kofte-2",
    name: "Köfte Ekmek",
    description:
      "3 Adet El Yapımı Köfte, Mayonez, Domates, Soğan",
    category: "Köfte & Tavuk",
    price: 350
  },

  {
    id: "markus-tavuk-1",
    name: "Tavuk Pirzola",
    description:
      "2 Adet Pirzola, Salata, Patates, Közlenmiş Biber, Domates",
    category: "Köfte & Tavuk",
    price: 500
  },


  /* ANA YEMEKLER */

  {
    id: "markus-makarna",
    name: "Makarna",
    description:
      "Krema, mantar / Krema, tavuk / Napolitan",
    category: "Ana Yemekler",
    price: 400
  },

  {
    id: "markus-manti",
    name: "Mantı",
    description:
      "Sarımsaklı yoğurt, salçalı tereyağlı sos",
    category: "Ana Yemekler",
    price: 400
  },

  {
    id: "markus-gozleme",
    name: "Gözleme",
    description:
      "Ispanak-lorlu / Kaşarlı / Patatesli",
    category: "Ana Yemekler",
    price: 250
  },

  {
    id: "markus-yumurta",
    name: "Yumurta",
    description:
      "Sahanda / Omlet",
    category: "Ana Yemekler",
    price: 250
  },


  /* ATIŞTIRMALIKLAR */

  {
    id: "markus-sigara",
    name: "Sigara Böreği",
    description:
      "5 Adet El Yapımı Sigara Böreği, Domates, Salatalık, Zeytin",
    category: "Atıştırmalıklar",
    price: 300
  },

  {
    id: "markus-patates",
    name: "Patates Kızartması",
    description:
      "Patates, ketçap, mayonez",
    category: "Atıştırmalıklar",
    price: 250
  },

  {
    id: "markus-patates-double",
    name: "Duble Patates Kızartması",
    description:
      "Patates, ketçap, mayonez",
    category: "Atıştırmalıklar",
    price: 350
  },

  {
    id: "markus-citir-tavuk",
    name: "Çıtır Tavuk Patates",
    description:
      "5 Adet Çıtır Tavuk, Patates",
    category: "Atıştırmalıklar",
    price: 350
  },

  {
    id: "markus-bira-tabagi",
    name: "Bira Tabağı",
    description:
      "Sosis, nugget, çıtır tavuk, soğan halkası, sigara böreği, mozzarella stick, patates",
    category: "Atıştırmalıklar",
    price: 500
  },


  /* İÇECEKLER */

  {
    id: "markus-cola",
    name: "Cola",
    description: "",
    category: "İçecekler",
    price: 150
  },

  {
    id: "markus-fanta",
    name: "Fanta",
    description: "",
    category: "İçecekler",
    price: 150
  },

  {
    id: "markus-sprite",
    name: "Sprite",
    description: "",
    category: "İçecekler",
    price: 150
  },

  {
    id: "markus-fuse",
    name: "Fuse Tea",
    description: "",
    category: "İçecekler",
    price: 150
  },

  {
    id: "markus-meyve",
    name: "Meyve Suyu",
    description: "",
    category: "İçecekler",
    price: 150
  },

  {
    id: "markus-soda",
    name: "Soda",
    description: "",
    category: "İçecekler",
    price: 50
  },

  {
    id: "markus-soda-meyve",
    name: "Soda Meyveli",
    description: "",
    category: "İçecekler",
    price: 70
  },

  {
    id: "markus-churchill",
    name: "Churchill",
    description: "",
    category: "İçecekler",
    price: 120
  },

  {
    id: "markus-limonata",
    name: "Limonata",
    description: "",
    category: "İçecekler",
    price: 200
  },

  {
    id: "markus-karadut",
    name: "Karadut",
    description: "",
    category: "İçecekler",
    price: 200
  },

  {
    id: "markus-milkshake",
    name: "Milkshake",
    description: "",
    category: "İçecekler",
    price: 250
  },

  {
    id: "markus-alkolsuz",
    name: "Alkolsüz Kokteyller",
    description: "",
    category: "İçecekler",
    price: 350
  },

  {
    id: "markus-enerji",
    name: "Enerji İçeceği",
    description: "",
    category: "İçecekler",
    price: 200
  },

  {
    id: "markus-ayran",
    name: "Ayran Küçük",
    description: "",
    category: "İçecekler",
    price: 50
  },

  {
    id: "markus-ayran-buyuk",
    name: "Ayran Büyük",
    description: "",
    category: "İçecekler",
    price: 70
  },

  {
    id: "markus-su-kucuk",
    name: "Su Küçük",
    description: "",
    category: "İçecekler",
    price: 30
  },

  {
    id: "markus-su-buyuk",
    name: "Su Büyük",
    description: "",
    category: "İçecekler",
    price: 70
  },

  {
    id: "markus-cay",
    name: "Çay",
    description: "",
    category: "İçecekler",
    price: 50
  },


  /* KAHVELER */

  {
    id: "markus-americano",
    name: "Ice Americano / Americano",
    description: "",
    category: "Kahveler",
    price: 200
  },

  {
    id: "markus-latte",
    name: "Ice Latte / Latte / Cappuccino",
    description: "",
    category: "Kahveler",
    price: 200
  },

  {
    id: "markus-caramel",
    name: "Ice Caramel Latte",
    description: "",
    category: "Kahveler",
    price: 200
  },

  {
    id: "markus-vanilla",
    name: "Ice Vanilla Latte",
    description: "",
    category: "Kahveler",
    price: 200
  },

  {
    id: "markus-flat",
    name: "Flat White",
    description: "",
    category: "Kahveler",
    price: 200
  },

  {
    id: "markus-cortado",
    name: "Cortado",
    description: "",
    category: "Kahveler",
    price: 200
  },

  {
    id: "markus-mocha",
    name: "Mocha",
    description: "",
    category: "Kahveler",
    price: 200
  },

  {
    id: "markus-long",
    name: "Long Black",
    description: "",
    category: "Kahveler",
    price: 200
  },

  {
    id: "markus-espresso",
    name: "Espresso",
    description: "",
    category: "Kahveler",
    price: 180
  },

  {
    id: "markus-turk",
    name: "Türk Kahvesi",
    description: "",
    category: "Kahveler",
    price: 150
  },


  /* ALKOLLÜ */

  {
    id: "markus-efes-pilsen",
    name: "Efes Pilsen",
    description: "",
    category: "Alkollü İçecekler",
    price: 250
  },

  {
    id: "markus-efes-malt",
    name: "Efes Malt",
    description: "",
    category: "Alkollü İçecekler",
    price: 250
  },

  {
    id: "markus-efes-ozel",
    name: "Efes Özel Seri",
    description: "",
    category: "Alkollü İçecekler",
    price: 250
  },

  {
    id: "markus-tuborg",
    name: "Tuborg",
    description: "",
    category: "Alkollü İçecekler",
    price: 250
  },

  {
    id: "markus-carlsberg",
    name: "Carlsberg",
    description: "",
    category: "Alkollü İçecekler",
    price: 250
  },

  {
    id: "markus-bomonti",
    name: "Bomonti Filtresiz",
    description: "",
    category: "Alkollü İçecekler",
    price: 250
  },

  {
    id: "markus-miller",
    name: "Miller",
    description: "",
    category: "Alkollü İçecekler",
    price: 250
  },

  {
    id: "markus-becks",
    name: "Becks",
    description: "",
    category: "Alkollü İçecekler",
    price: 250
  },

  {
    id: "markus-belfast",
    name: "Belfast",
    description: "",
    category: "Alkollü İçecekler",
    price: 250
  },

  {
    id: "markus-bud",
    name: "Bud",
    description: "",
    category: "Alkollü İçecekler",
    price: 250
  },

  {
    id: "markus-corona",
    name: "Corona",
    description: "",
    category: "Alkollü İçecekler",
    price: 250
  },

  {
    id: "markus-desperados",
    name: "Desperados",
    description: "",
    category: "Alkollü İçecekler",
    price: 300
  },

  {
    id: "markus-sol",
    name: "Sol",
    description: "",
    category: "Alkollü İçecekler",
    price: 300
  },

  {
    id: "markus-blanc",
    name: "Blanc",
    description: "",
    category: "Alkollü İçecekler",
    price: 300
  },

  {
    id: "markus-stella",
    name: "Stella Artois",
    description: "",
    category: "Alkollü İçecekler",
    price: 300
  },

  {
    id: "markus-raki",
    name: "Rakı Tek/Duble",
    description: "",
    category: "Alkollü İçecekler",
    price: 250
  },

  {
    id: "markus-viski",
    name: "Viski Tek/Duble",
    description: "",
    category: "Alkollü İçecekler",
    price: 250
  },

  {
    id: "markus-cin",
    name: "Cin Tek/Duble",
    description: "",
    category: "Alkollü İçecekler",
    price: 250
  },

  {
    id: "markus-vodka",
    name: "Vodka Tek/Duble",
    description: "",
    category: "Alkollü İçecekler",
    price: 250
  },

  {
    id: "markus-sarap",
    name: "Şarap Kadeh",
    description: "",
    category: "Alkollü İçecekler",
    price: 300
  },


  /* KOKTEYLLER */

  {
    id: "markus-mojito",
    name: "Mojito",
    description: "",
    category: "Kokteyller",
    price: 500
  },

  {
    id: "markus-strawberry",
    name: "Strawberry Mojito",
    description: "",
    category: "Kokteyller",
    price: 500
  },

  {
    id: "markus-long-island",
    name: "Long Island",
    description: "",
    category: "Kokteyller",
    price: 600
  },

  {
    id: "markus-margarita",
    name: "Margarita",
    description: "",
    category: "Kokteyller",
    price: 500
  },

  {
    id: "markus-tequila",
    name: "Tequila Sunrise",
    description: "",
    category: "Kokteyller",
    price: 500
  },

  {
    id: "markus-sex",
    name: "Sex On The Beach",
    description: "",
    category: "Kokteyller",
    price: 500
  },

  {
    id: "markus-bana",
    name: "Bana Bırak",
    description: "",
    category: "Kokteyller",
    price: 500
  },

  {
    id: "markus-cin-tonik",
    name: "Cin Tonik",
    description: "",
    category: "Kokteyller",
    price: 500
  },

  {
    id: "markus-vodka-redbull",
    name: "Vodka Redbull",
    description: "",
    category: "Kokteyller",
    price: 500
  }

];


let cart = [];


/* =====================================
   BAŞLANGIÇ
===================================== */

document.addEventListener(
  "DOMContentLoaded",
  initMarkus
);


function initMarkus() {

  console.log(
    "MARKUS MENÜ BAŞLADI"
  );


  const tableBadge =
    document.getElementById(
      "tableBadge"
    );


  if (tableBadge) {

    tableBadge.textContent =
      `Masa ${tableNumber}`;

  }


  renderMarkusCategories();

  renderMarkusMenu();

  renderMarkusCart();

}


/* =====================================
   KATEGORİLER
===================================== */

function getMarkusCategories() {

  return [
    ...new Set(
      products.map(
        product =>
          product.category
      )
    )
  ];

}


function renderMarkusCategories() {

  const element =
    document.getElementById(
      "categories"
    );


  if (!element) {
    return;
  }


  const list =
    getMarkusCategories();


  element.innerHTML =
    list
      .map(
        (category, index) => `
          <button
            class="${
              index === 0
                ? "active"
                : ""
            }"
            onclick="scrollToMarkusCategory('${escAttr(category)}')"
          >
            ${esc(category)}
          </button>
        `
      )
      .join("");

}


/* =====================================
   MENÜ
===================================== */

function renderMarkusMenu() {

  const menu =
    document.getElementById(
      "menu"
    );


  if (!menu) {
    return;
  }


  const categories =
    getMarkusCategories();


  menu.innerHTML =
    categories
      .map(category => {

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

            ${
              categoryProducts
                .map(
                  markusProductHTML
                )
                .join("")
            }

          </section>
        `;

      })
      .join("");

}


/* =====================================
   ÜRÜN
===================================== */

function markusProductHTML(
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
            product.price
          ).toFixed(2)}
        </div>

      </div>


      <button
        class="add"
        onclick="addMarkusToCart('${escAttr(product.id)}')"
      >
        Ekle
      </button>

    </article>
  `;

}


/* =====================================
   SEPETE EKLE
===================================== */

function addMarkusToCart(
  id
) {

  const product =
    products.find(
      item =>
        item.id === id
    );


  if (!product) {
    return;
  }


  const existing =
    cart.find(
      item =>
        item.id === id
    );


  if (existing) {

    existing.qty += 1;

  } else {

    cart.push({

      id: product.id,

      name: product.name,

      price: Number(
        product.price
      ),

      qty: 1,

      note: ""

    });

  }


  renderMarkusCart();

  openMarkusCart();

}


/* =====================================
   ADET
===================================== */

function changeMarkusQty(
  id,
  amount
) {

  const item =
    cart.find(
      item =>
        item.id === id
    );


  if (!item) {
    return;
  }


  item.qty += amount;


  if (item.qty <= 0) {

    cart =
      cart.filter(
        item =>
          item.id !== id
      );

  }


  renderMarkusCart();

}


/* =====================================
   SEPET
===================================== */

function renderMarkusCart() {

  const countElement =
    document.getElementById(
      "cartCount"
    );


  const totalElement =
    document.getElementById(
      "cartTotal"
    );


  const itemsElement =
    document.getElementById(
      "cartItems"
    );


  if (
    !countElement ||
    !totalElement ||
    !itemsElement
  ) {
    return;
  }


  const count =
    cart.reduce(
      (sum, item) =>
        sum + item.qty,
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


  countElement.textContent =
    count;


  totalElement.textContent =
    "₺" +
    total.toFixed(2);


  if (!cart.length) {

    itemsElement.innerHTML =
      "<p>Sepet boş.</p>";

    return;

  }


  itemsElement.innerHTML =
    cart
      .map(
        item => `

          <div
            class="cart-row"
            style="
              padding:12px;
              border-bottom:1px solid #ddd;
              margin-bottom:8px;
            "
          >

            <div
              style="
                display:flex;
                justify-content:space-between;
              "
            >

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


            <div
              style="
                display:flex;
                align-items:center;
                gap:14px;
                margin-top:10px;
              "
            >

              <button
                onclick="changeMarkusQty('${escAttr(item.id)}',-1)"
              >
                −
              </button>

              <span>
                ${item.qty}
              </span>

              <button
                onclick="changeMarkusQty('${escAttr(item.id)}',1)"
              >
                +
              </button>

            </div>

          </div>

        `
      )
      .join("");

}


/* =====================================
   SEPET AÇ / KAPAT
===================================== */

function openMarkusCart() {

  const modal =
    document.getElementById(
      "cartModal"
    );


  if (modal) {

    modal.classList.remove(
      "hidden"
    );

  }

}


function openCart() {
  openMarkusCart();
}


function closeCart() {

  const modal =
    document.getElementById(
      "cartModal"
    );


  if (modal) {

    modal.classList.add(
      "hidden"
    );

  }

}


/* =====================================
   SİPARİŞ GÖNDER
===================================== */

async function placeOrder() {

  if (!cart.length) {

    alert(
      "Sepet boş."
    );

    return;
  }


  const button =
    document.querySelector(
      "#cartModal .primary"
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


  const orderItems =
    cart.map(
      item => ({

        order_id:
          order.id,

        product_id:
          null,

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
    error:
      itemsError
  } =
    await db
      .from("order_items")
      .insert(
        orderItems
      );


  if (itemsError) {

    alert(
      "Sipariş ürünleri kaydedilemedi: " +
      itemsError.message
    );

    return;
  }


  cart = [];


  if (noteElement) {

    noteElement.value =
      "";

  }


  renderMarkusCart();

  closeCart();


  showMarkusNotice(
    `Siparişiniz alındı. Masa ${tableNumber}.`
  );


  if (button) {

    button.disabled =
      false;

    button.textContent =
      "Siparişi Gönder";

  }

}


/* =====================================
   SİPARİŞ GEÇMİŞİ
===================================== */

async function loadOrderHistory() {

  const element =
    document.getElementById(
      "orderHistoryContent"
    );


  if (!element) {
    return;
  }


  element.innerHTML =
    "<p>Siparişler yükleniyor...</p>";


  const {
    data,
    error
  } =
    await db
      .from("orders")
      .select(
        "id, created_at, status, total, table_number"
      )
      .eq(
        "table_number",
        String(
          tableNumber
        )
      )
      .order(
        "created_at",
        {
          ascending: false
        }
      );


  if (error) {

    element.innerHTML = `
      <p>
        Siparişler yüklenemedi.
      </p>
    `;

    console.error(
      error
    );

    return;
  }


  if (!data || !data.length) {

    element.innerHTML = `
      <p>
        Bu masa için henüz sipariş yok.
      </p>
    `;

    return;
  }


  const total =
    data.reduce(
      (sum, order) =>
        sum +
        Number(
          order.total || 0
        ),
      0
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


  element.innerHTML = `

    <div
      style="
        padding:16px;
        margin-bottom:16px;
        border:1px solid #d9d1c5;
        border-radius:14px;
        background:#fff;
      "
    >

      <strong>
        Masa toplamı
      </strong>

      <div
        style="
          margin-top:6px;
          color:#07553f;
          font-size:24px;
          font-weight:700;
        "
      >
        ₺${total.toFixed(2)}
      </div>

    </div>


    ${data.map(order => {

      const date =
        new Date(
          order.created_at
        ).toLocaleString(
          "tr-TR",
          {
            day: "2-digit",
            month: "2-digit",
            hour: "2-digit",
            minute: "2-digit"
          }
        );


      return `

        <div
          style="
            padding:15px;
            margin-bottom:10px;
            border:1px solid #d9d1c5;
            border-radius:14px;
            background:#fff;
          "
        >

          <div
            style="
              display:flex;
              justify-content:space-between;
              gap:10px;
            "
          >

            <strong>
              Sipariş
            </strong>

            <strong>
              ₺${Number(
                order.total || 0
              ).toFixed(2)}
            </strong>

          </div>


          <div
            style="
              margin-top:7px;
              color:#777;
              font-size:13px;
            "
          >
            ${date}
          </div>


          <div
            style="
              margin-top:8px;
              color:#07553f;
              font-weight:600;
            "
          >
            ${
              statusNames[
                order.status
              ] ||
              order.status
            }
          </div>

        </div>

      `;

    }).join("")}

  `;

}


/* =====================================
   KATEGORİYE GİT
===================================== */

function scrollToMarkusCategory(
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


/* =====================================
   BİLDİRİM
===================================== */

function showMarkusNotice(
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


  setTimeout(
    () => {

      notice.classList.add(
        "hidden"
      );

    },
    4000
  );

}


/* =====================================
   GÜVENLİ HTML
===================================== */

function esc(value) {

  return String(
    value ?? ""
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


function escAttr(value) {

  return esc(value);

}


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
