# QR Sipariş V1

Kafeler/restoranlar için QR menü + sepet + sipariş + garson/admin paneli.

## V1 özellikleri
- Her masa için ayrı QR URL: `customer/index.html?table=1`
- Müşteri hesap açmadan menüyü görür.
- Ürünleri sepete ekler.
- Ürün adedi değiştirilebilir.
- Her ürün için özel not eklenebilir.
- Sipariş gönderildiğinde masa numarası ile admin paneline anlık düşer.
- Admin panelinde siparişler: Yeni / Hazırlanıyor / Hazır / Tamamlandı durumları.
- Yeni siparişler Supabase Realtime ile canlı güncellenir.
- Admin girişi Supabase Auth üzerinden yapılır.

## Kurulum

### 1. Supabase
Supabase'te yeni proje oluştur.

SQL Editor'a `supabase/schema.sql` dosyasını komple yapıştırıp çalıştır.

Authentication > Users bölümünden mekan sahibi/garson için bir kullanıcı oluştur.

### 2. Frontend bağlantısı
`customer/app.js` ve `admin/app.js` içindeki:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

alanlarını kendi Supabase bilgilerinizle doldurun.

### 3. Menü
`supabase/schema.sql` içindeki örnek ürünleri değiştirebilir veya Supabase Table Editor'dan `products` tablosunu düzenleyebilirsin.

### 4. GitHub
Bu klasörü GitHub repository'sine yükle.

GitHub Pages kullanacaksan:
- repository > Settings > Pages
- Deploy from branch
- main / root

Örnek müşteri linkleri:
- `https://KULLANICI.github.io/REPO/customer/?table=1`
- `https://KULLANICI.github.io/REPO/customer/?table=2`

Her masa için QR kod bu URL'nin QR'ıdır.

Admin paneli:
`https://KULLANICI.github.io/REPO/admin/`

## Önemli
Bu V1'de müşteri hesabı YOK. Müşterinin telefon/e-posta bilgisine gerek yok.
Masa numarası QR URL'sinden gelir.

İleride:
- garson çağır
- ödeme
- sipariş geçmişi
- stok
- ürün/kategori yönetimi
- mekan sahibi / garson ayrı yetki
- çoklu işletme
- QR üretme paneli
eklenebilir.
