const SUPABASE_URL = "YOUR_SUPABASE_URL";
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";
const db = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
let orders=[];

document.addEventListener("DOMContentLoaded", async()=>{const {data:{session}}=await db.auth.getSession(); if(session) showApp();});

async function login(){
  const email=document.getElementById("email").value;
  const password=document.getElementById("password").value;
  const {error}=await db.auth.signInWithPassword({email,password});
  if(error){document.getElementById("loginError").textContent=error.message;return}
  showApp();
}
async function logout(){await db.auth.signOut();location.reload();}
async function showApp(){
  document.getElementById("loginView").classList.add("hidden");
  document.getElementById("appView").classList.remove("hidden");
  await loadOrders();
  db.channel("orders-live").on("postgres_changes",{event:"*",schema:"public",table:"orders"},()=>loadOrders()).subscribe();
  db.channel("items-live").on("postgres_changes",{event:"*",schema:"public",table:"order_items"},()=>loadOrders()).subscribe();
}
async function loadOrders(){
  const {data,error}=await db.from("orders").select("*, order_items(*)").order("created_at",{ascending:false});
  if(error){console.error(error);return}
  orders=data||[];render();
}
function render(){
  const active=orders.filter(o=>o.status!=="completed");
  document.getElementById("newCount").textContent=orders.filter(o=>o.status==="new").length;
  document.getElementById("prepCount").textContent=orders.filter(o=>o.status==="preparing").length;
  document.getElementById("readyCount").textContent=orders.filter(o=>o.status==="ready").length;
  document.getElementById("orders").innerHTML=active.length?active.map(orderHTML).join(""):"<div class='order'><strong>Aktif sipariş yok.</strong></div>";
}
function orderHTML(o){
  const items=(o.order_items||[]).map(i=>`<div class="item"><div class="item-top"><span>${i.quantity} × ${esc(i.product_name)}</span><span>₺${(i.quantity*i.unit_price).toFixed(2)}</span></div>${i.note?`<div class="note">Not: ${esc(i.note)}</div>`:""}</div>`).join("");
  const statusName={new:"Yeni",preparing:"Hazırlanıyor",ready:"Hazır",completed:"Tamamlandı"}[o.status]||o.status;
  return `<article class="order ${o.status==="new"?"new":""}">
    <div class="order-head"><div class="table">Masa ${esc(o.table_number)}</div><div class="time">${new Date(o.created_at).toLocaleTimeString("tr-TR",{hour:"2-digit",minute:"2-digit"})}</div></div>
    <div class="status ${o.status}">${statusName}</div>
    ${items}
    ${o.customer_note?`<div class="customer-note"><strong>Sipariş notu:</strong> ${esc(o.customer_note)}</div>`:""}
    <div class="actions">${buttons(o)}</div>
  </article>`;
}
function buttons(o){
  if(o.status==="new")return `<button onclick="setStatus('${o.id}','preparing')">Hazırlamaya Al</button>`;
  if(o.status==="preparing")return `<button onclick="setStatus('${o.id}','ready')">Hazır</button>`;
  if(o.status==="ready")return `<button onclick="setStatus('${o.id}','completed')">Tamamlandı</button>`;
  return "";
}
async function setStatus(id,status){await db.from("orders").update({status}).eq("id",id);await loadOrders();}
function esc(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));}
