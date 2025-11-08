# Demo Requests Yönetimi

## Genel Bakış

Demo sayfasından gelen taleplerin admin panelinde takip edilmesi için **Demo Request** content type'ı oluşturuldu.

## Özellikler

### Form Alanları
- **Full Name** (Zorunlu): Kullanıcının adı soyadı
- **Email** (Zorunlu, Unique): Kullanıcının email adresi
- **Phone** (Zorunlu): Telefon numarası
- **Company Name** (Opsiyonel): Şirket adı
- **Message** (Opsiyonel): Kullanıcının mesajı
- **Status**: Demo talebinin durumu
  - `pending`: Beklemede (varsayılan)
  - `contacted`: İletişime geçildi
  - `converted`: Dönüştürüldü (müşteri oldu)
  - `rejected`: Reddedildi
- **Notes**: Admin notları
- **Source**: Talebin kaynağı (varsayılan: "website")

## Admin Panelinde Kullanım

### 1. Strapi Admin Paneline Erişim
```
http://localhost:1337/admin
```

### 2. Demo Requests'i Görüntüleme
1. Sol menüden **Content Manager** > **Demo Request** seçeneğini seçin
2. Tüm demo talepleri liste halinde görüntülenecektir
3. Her talebin detaylarını görmek için üzerine tıklayın

### 3. Demo Talebini Güncelleme
1. Bir demo talebini açın
2. **Status** alanını güncelleyin (pending → contacted → converted)
3. **Notes** alanına admin notları ekleyin
4. **Save** butonuna tıklayın

### 4. Filtreleme ve Arama
- Status'e göre filtreleme yapabilirsiniz
- Email veya isim ile arama yapabilirsiniz
- Tarih aralığı ile filtreleme yapabilirsiniz

## API Endpoints

### Public Endpoint (Form Submission)
```
POST /api/demo-requests/submit
```

**Request Body:**
```json
{
  "fullName": "Ahmet Yılmaz",
  "email": "ahmet@example.com",
  "phone": "05551234567",
  "companyName": "ABC Şirketi",
  "message": "Demo talep ediyorum"
}
```

**Response (Success):**
```json
{
  "data": {
    "id": 1,
    "fullName": "Ahmet Yılmaz",
    "email": "ahmet@example.com",
    "phone": "05551234567",
    "companyName": "ABC Şirketi",
    "message": "Demo talep ediyorum",
    "status": "pending",
    "source": "website",
    "createdAt": "2025-11-08T14:45:00.000Z"
  },
  "message": "Demo request submitted successfully"
}
```

### Admin Endpoints
```
GET /api/demo-requests          # Tüm demo talepleri
GET /api/demo-requests/:id      # Belirli bir demo talebi
PUT /api/demo-requests/:id      # Demo talebini güncelle
DELETE /api/demo-requests/:id   # Demo talebini sil
```

**Not:** Admin endpoints'leri için authentication gereklidir.

## İzinler (Permissions)

### Admin Rolü
- ✅ Tüm demo talepleri görüntüleyebilir
- ✅ Demo taleplerini güncelleyebilir
- ✅ Demo taleplerini silebilir
- ✅ Notes ekleyebilir

### Employee Rolü (Yönetici)
- ✅ Tüm demo talepleri görüntüleyebilir
- ✅ Demo taleplerini güncelleyebilir
- ✅ Notes ekleyebilir

### Public
- ✅ Sadece form submission yapabilir (`/api/demo-requests/submit`)

## İzinleri Ayarlama

1. Admin panelde **Settings** > **Users & Permissions Plugin** > **Roles** bölümüne gidin
2. **Admin** rolünü seçin
3. **Demo-request** altındaki tüm izinleri aktif edin:
   - ✅ find
   - ✅ findOne
   - ✅ create
   - ✅ update
   - ✅ delete
4. **Save** butonuna tıklayın

Employee rolü için de aynı adımları tekrarlayın (isteğe bağlı olarak delete iznini vermeyebilirsiniz).

## Test Etme

### 1. Demo Formu Test
1. Frontend'i çalıştırın: `http://localhost:3001/demo`
2. Formu doldurun ve gönderin
3. "Demo talebiniz başarıyla iletildi!" mesajını görmelisiniz

### 2. Admin Panelde Kontrol
1. `http://localhost:1337/admin` adresine gidin
2. **Content Manager** > **Demo Request** seçin
3. Az önce gönderdiğiniz talebi listede görmelisiniz

### 3. Status Güncelleme
1. Talebi açın
2. Status'u "contacted" olarak değiştirin
3. Notes alanına "Müşteri ile görüşüldü" ekleyin
4. Save edin

## Troubleshooting

### "Demo Request" menüde görünmüyor
```bash
npm run build
npm run develop
```
komutlarını çalıştırıp Strapi'yi yeniden başlatın.

### Permission hatası alıyorum
Admin panelden **Settings** > **Users & Permissions Plugin** > **Roles** > **Public** bölümüne gidin ve demo-request için sadece "create" izninin açık olduğundan emin olun.

### Email already exists hatası
Her email adresi benzersiz olmalıdır. Aynı email ile birden fazla demo talebi gönderilemez.

## Örnek Workflow

1. **Kullanıcı demo formu doldurur** → Status: `pending`
2. **Admin demo talebini görür** → Content Manager'dan kontrol
3. **Admin kullanıcı ile iletişime geçer** → Status: `contacted`, Notes: "Telefon ile görüşüldü"
4. **Kullanıcı müşteri olur** → Status: `converted`, Notes: "Premium plan satın aldı"
5. **Veya talep reddedilir** → Status: `rejected`, Notes: "Bütçe uygun değil"

## Bildirimler (Gelecek Geliştirme)

Gelecekte eklenebilecek özellikler:
- Yeni demo talebi geldiğinde email bildirimi
- Slack/Discord entegrasyonu
- WhatsApp otomatik mesaj gönderimi
- CRM entegrasyonu (HubSpot, Pipedrive, vb.)

