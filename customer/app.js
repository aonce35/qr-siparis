const SUPABASE_URL = "https://dppqwgsawarkyzzonzyu.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_fhNovHoi8Xgh1jScRsdrgQ_ZCe6I4tP";
const db = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const params = new URLSearchParams(location.search);
const tableNumber = params.get("table");
let products = [];
let cart = [];

document.addEventListener("DOMContentLoaded", init);

async function init(){
  if(!tableNumber){
    showNotice("Masa bilgisi bulunamadı. Lütfen masadaki QR kodu okutun.");
    return;
  }
  document.getElementById("tableBadge").textContent = `Masa ${tableNumber}`;
  await loadRestaurant();
  await loadProducts();
  renderCategories();
  renderMenu();
  renderCart();
}

async function loadRestaurant(){
  const {data} = await db.from("restaurant_settings").select("*").limit(1).maybeSingle();
  if(data?.name) document.getElementById("restaurantName").textContent = data.name;
}

async function loadProducts(){
  const {data,error} = await db.from("products").select("*").eq("is_active",true).order("sort_order");
  if(error){ showNotice("Menü yüklenemedi."); console.error(error); return; }
  products = data || [];
}

function categories(){
  return [...new Set(products.map(p=>p.category))];
}

function renderCategories(){
  const el=document.getElementById("categories");
  el.innerHTML=categories().map((c,i)=>`<button class="category ${i===0?'active':''}" onclick="scrollToCategory('${esc(c)}')">${esc(c)}</button>`).join("");
}

function renderMenu(){
  document.getElementById("menu").innerHTML=categories().map(c=>`
    <section id="cat-${slug(c)}">
      <h2 class="category-title">${esc(c)}</h2>
      ${products.filter(p=>p.category===c).map(productHTML).join("")}
    </section>
  `).join("");
}

function productHTML(p){
  return `<article class="product">
    <div class="product-info">
      <h3>${esc(p.name)}</h3>
      <p>${esc(p.description||"")}</p>
      <div class="price">₺${Number(p.price).toFixed(2)}</div>
    </div>
    <button class="add" onclick="addToCart('${p.id}')">Ekle</button>
  </article>`;
}

function addToCart(id){
  const p=products.find(x=>x.id===id);
  if(!p)return;
  const existing=cart.find(x=>x.id===id);
  if(existing) existing.qty++;
  else cart.push({id:p.id,name:p.name,price:Number(p.price),qty:1,note:""});
  renderCart();
  openCart();
}

function changeQty(id,delta){
  const item=cart.find(x=>x.id===id);
  if(!item)return;
  item.qty+=delta;
  if(item.qty<=0) cart=cart.filter(x=>x.id!==id);
  renderCart();
}

function updateItemNote(id,value){
  const item=cart.find(x=>x.id===id);
  if(item)item.note=value;
}

function renderCart(){
  document.getElementById("cartCount").textContent=cart.reduce((s,x)=>s+x.qty,0);
  document.getElementById("cartTotal").textContent="₺"+cart.reduce((s,x)=>s+x.price*x.qty,0).toFixed(2);
  document.getElementById("cartItems").innerHTML=cart.length?cart.map(x=>`
    <div class="cart-row">
      <div class="cart-main"><strong>${esc(x.name)}</strong><strong>₺${(x.price*x.qty).toFixed(2)}</strong></div>
      <div class="qty"><button onclick="changeQty('${x.id}',-1)">−</button><span>${x.qty}</span><button onclick="changeQty('${x.id}',1)">+</button></div>
      <input class="item-note" value="${escAttr(x.note)}" placeholder="Bu ürün için not..." oninput="updateItemNote('${x.id}',this.value)">
    </div>`).join(""):"<p>Sepet boş.</p>";
}

async function placeOrder(){
  if(!cart.length){alert("Sepet boş.");return;}
  const button=document.querySelector(".primary");
  button.disabled=true; button.textContent="Gönderiliyor...";
  const total=cart.reduce((s,x)=>s+x.price*x.qty,0);
  const orderNote=document.getElementById("orderNote").value.trim();

  const {data:order,error}=await db.from("orders").insert({
    table_number:String(tableNumber),
    status:"new",
    total,
    customer_note:orderNote || null
  }).select().single();

  if(error){alert("Sipariş gönderilemedi.");button.disabled=false;button.textContent="Siparişi Gönder";return;}

  const items=cart.map(x=>({order_id:order.id,product_id:x.id,product_name:x.name,quantity:x.qty,unit_price:x.price,note:x.note||null}));
  const {error:itemError}=await db.from("order_items").insert(items);
  if(itemError){alert("Sipariş ürünleri kaydedilemedi.");button.disabled=false;return;}

  cart=[]; document.getElementById("orderNote").value="";
  renderCart(); closeCart();
  showNotice(`Siparişiniz alındı. Masa ${tableNumber}.`);
  button.disabled=false; button.textContent="Siparişi Gönder";
}

function openCart(){document.getElementById("cartModal").classList.remove("hidden");renderCart();}
function closeCart(){document.getElementById("cartModal").classList.add("hidden");}
function scrollToCategory(c){document.getElementById("cat-"+slug(c))?.scrollIntoView({behavior:"smooth",block:"start"});}
function showNotice(t){const n=document.getElementById("notice");n.textContent=t;n.classList.remove("hidden");}
function slug(s){return s.toLowerCase().replace(/[^a-z0-9çğıöşü]+/g,"-");}
function esc(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));}
function escAttr(s){return esc(s);}
