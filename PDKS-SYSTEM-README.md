# PDKS (Personel Devam Kontrol Sistemi) Dokümantasyonu

## 📋 Genel Bakış

PDKS sistemi, çalışanların QR kod okutarak güvenli bir şekilde giriş-çıkış yapmasını sağlar. Sistem, şirketler tarafından oluşturulan zaman sınırlı QR kodları kullanır ve çoklu güvenlik katmanlarıyla korunur.

## 🔒 Güvenlik Özellikleri

### 1. QR Kod Güvenliği
- **Zaman Sınırlı Token**: Her QR kod belirli bir süre sonra otomatik olarak geçersiz olur
- **Benzersiz Session Token**: Crypto modülü ile oluşturulan 256-bit benzersiz tokenlar
- **Kullanım Limiti**: Maksimum kullanım sayısı belirlenebilir
- **Otomatik Devre Dışı**: Süresi dolan veya limit aşan QR kodlar otomatik devre dışı

### 2. Konum Bazlı Doğrulama
- **GPS Koordinat Kontrolü**: QR kod belirli bir konuma bağlanabilir
- **Yarıçap Kısıtlaması**: Belirlenen yarıçap dışından okutma engellenir
- **Haversine Formülü**: Mesafe hesaplaması için hassas algoritma kullanılır

### 3. IP Adresi Kısıtlama
- **Beyaz Liste**: İzin verilen IP adresleri tanımlanabilir
- **Ağ Güvenliği**: Sadece belirtilen ağlardan erişim

### 4. Çift Kayıt Engelleme
- **1 Dakikalık Koruma**: Aynı işlem 1 dakika içinde tekrarlanamaz
- **Giriş-Çıkış Sırası**: Mantıksal sıra kontrolü (giriş sonra çıkış)

### 5. İzleme ve Denetim
- **IP Adresi Kaydı**: Her işlemin IP adresi loglanır
- **User Agent Kaydı**: Cihaz ve tarayıcı bilgileri saklanır
- **Konum Kaydı**: GPS koordinatları kaydedilir
- **Manuel İşlem İzleme**: Yönetici müdahaleleri ayrıca işaretlenir

## 🏗️ Sistem Mimarisi

### Backend API (Strapi)

#### Content Types

1. **QR Code Session** (`qr-code-session`)
```json
{
  "company": "relation",
  "sessionToken": "string (unique)",
  "expiresAt": "datetime",
  "isActive": "boolean",
  "usageCount": "integer",
  "maxUsageCount": "integer",
  "branch": "relation",
  "locationLatitude": "decimal",
  "locationLongitude": "decimal",
  "locationRadius": "integer",
  "allowedIpAddresses": "text",
  "sessionName": "string"
}
```

2. **PDKS Attendance** (`pdks-attendance`)
```json
{
  "worker": "relation",
  "company": "relation",
  "checkType": "enum (in/out)",
  "checkTime": "datetime",
  "qrCodeSession": "relation",
  "locationLatitude": "decimal",
  "locationLongitude": "decimal",
  "ipAddress": "string",
  "userAgent": "string",
  "isManual": "boolean",
  "branch": "relation"
}
```

#### API Endpoints

##### QR Code Management (Company Only)

- `POST /api/qr-code-sessions/create` - Yeni QR kod oluştur
- `GET /api/qr-code-sessions/my-sessions` - Aktif QR kodlarını listele
- `POST /api/qr-code-sessions/:id/deactivate` - QR kodu devre dışı bırak
- `POST /api/qr-code-sessions/validate` - QR kod doğrula

##### Attendance Operations

- `POST /api/pdks-attendances/check` - Giriş-çıkış yap (Worker)
- `GET /api/pdks-attendances/my-records` - Kendi kayıtlarımı görüntüle (Worker)
- `GET /api/pdks-attendances/company-records` - Tüm kayıtları görüntüle (Company)
- `GET /api/pdks-attendances/monthly-report` - Aylık rapor (Company)
- `POST /api/pdks-attendances/manual-entry` - Manuel kayıt ekle (Company)
- `DELETE /api/pdks-attendances/:id` - Kayıt sil (Company)

### Backend Admin Panel (Next.js)

#### Sayfalar

1. **PDKS Ana Sayfa** (`/pdks`)
   - Aktif QR kodları listesi
   - Son giriş-çıkış kayıtları
   - Yeni QR kod oluşturma
   - QR kod görüntüleme ve indirme

2. **Kayıtlar Sayfası** (`/pdks/records`)
   - Tüm giriş-çıkış kayıtları
   - Gelişmiş filtreleme (tarih, çalışan, şube)
   - CSV export
   - Manuel kayıt ekleme/silme

3. **Raporlar Sayfası** (`/pdks/reports`)
   - Aylık çalışma çizelgesi
   - Çalışan bazlı detaylı rapor
   - Toplam çalışma saati hesaplama
   - CSV export

### Frontend (Worker) (Next.js)

#### QR Okutma Sayfası (`/pdks-giris`)

- Kamera erişimi ile QR kod okutma
- Giriş/Çıkış seçimi
- Otomatik konum tespiti
- Gerçek zamanlı sonuç gösterimi

## 📱 Kullanım Senaryoları

### Senaryo 1: Standart Giriş-Çıkış

1. **Şirket (Admin):**
   - Admin paneline giriş yap
   - PDKS > Yeni QR Kod Oluştur
   - Parametreleri ayarla:
     - Oturum adı: "Ana Giriş"
     - Şube: (isteğe bağlı)
     - Geçerlilik: 5 dakika
     - Max kullanım: boş (sınırsız)
   - QR kodu indir ve giriş noktasına yerleştir

2. **Çalışan (Worker):**
   - `/pdks-giris` sayfasına git
   - "Giriş" seç
   - "QR Kod Okutmaya Başla"
   - QR kodu okut
   - Başarı mesajı

3. **İş Çıkışı:**
   - Aynı sayfaya git
   - "Çıkış" seç
   - Aynı QR kodu okut

### Senaryo 2: Şube Bazlı Takip

1. **Şirket:**
   - Her şube için ayrı QR kod oluştur
   - Şube seçimini yap
   - Her şubenin girişine farklı QR kod yerleştir

2. **Çalışan:**
   - Kendi şubesindeki QR kodu okut
   - Sistem otomatik şube ataması yapar

### Senaryo 3: Konum Kısıtlamalı QR

1. **Şirket:**
   - QR kod oluştururken konum bilgisi ekle
   - Yarıçap belirle (örn: 100 metre)

2. **Çalışan:**
   - Sadece belirlenen konum yarıçapı içinden okutabilir
   - Uzak konumdan okutma engellenir

### Senaryo 4: Manuel Kayıt

1. **Şirket:**
   - PDKS > Kayıtlar
   - "Manuel Kayıt Ekle"
   - Çalışan, tarih, saat, notlar ekle
   - Kaydet

## 🔧 Kurulum ve Yapılandırma

### Backend API

1. Strapi sunucusunu başlat:
```bash
cd ahikariyer-ik-api-main
npm run develop
```

2. Admin panelinden content types'ların oluşturulduğunu doğrula

3. Permissions ayarla:
   - QR Code Session: Sadece Company role
   - PDKS Attendance: Worker (check, my-records), Company (all)

### Backend Admin Panel

1. QRCode paketinin yüklü olduğunu doğrula:
```bash
cd ahikariyer-ik-backend-main
npm install react-qr-code
```

2. Sunucuyu başlat:
```bash
npm run dev
```

3. `/pdks` sayfasına giriş yap ve test et

### Frontend

1. QR scanner paketini yükle:
```bash
cd ahikariyer-ik-front-main
npm install html5-qrcode
```

2. Environment variables ayarla:
```env
NEXT_PUBLIC_API_URL=http://localhost:1337
```

3. Sunucuyu başlat:
```bash
npm run dev
```

4. `/pdks-giris` sayfasına git

## 📊 Raporlama

### Aylık Çalışma Raporu

Rapor şunları içerir:
- Günlük giriş-çıkış saatleri
- Günlük toplam çalışma süresi
- Aylık toplam çalışma süresi
- Eksik giriş/çıkış kayıtları
- Manuel kayıtlar

### Export Formatları

- **CSV**: Excel'de açılabilir format
- Türkçe karakter desteği (UTF-8 BOM)
- Tarih formatı: DD/MM/YYYY HH:mm

## 🛡️ Güvenlik Best Practices

1. **QR Kod Ömrü**: 5-15 dakika arası tutun
2. **Konum Doğrulama**: Mümkünse her zaman aktif edin
3. **IP Kısıtlama**: Ofis ağı için aktif edin
4. **Düzenli Kontrol**: Kayıtları düzenli inceleyin
5. **Manuel Kayıt Notları**: Her manuel kayda açıklama ekleyin
6. **Rol Kontrolü**: API'de rol bazlı erişim kontrolü aktif
7. **Token Yenileme**: Uzun süreli kullanımlar için QR kod yenileyin

## 🐛 Hata Durumları ve Çözümler

### "QR kod süresi dolmuş"
- **Sebep**: QR kod geçerlilik süresi bitmiş
- **Çözüm**: Yöneticiden yeni QR kod isteyin

### "Konum uyumsuz"
- **Sebep**: Çalışan belirlenen alan dışında
- **Çözüm**: Doğru konuma gidin veya yöneticiye bildirin

### "Son kaydınız giriş"
- **Sebep**: Çıkış yapmadan tekrar giriş yapılmaya çalışılıyor
- **Çözüm**: Çıkış işlemi yapın

### "Kamera erişimi reddedildi"
- **Sebep**: Tarayıcı kamera iznini vermiyor
- **Çözüm**: Tarayıcı ayarlarından kamera iznini etkinleştirin

## 📞 Destek ve İletişim

Sistem hataları veya öneriler için:
- Backend API loglarını kontrol edin
- Browser console'u inceleyin
- Network sekmesinde API çağrılarını kontrol edin

## 🔄 Güncellemeler ve İyileştirmeler

### Gelecek Özellikler (Öneriler)

1. **Yüz Tanıma**: QR kod ile birlikte yüz tanıma
2. **NFC Desteği**: QR kod alternatifi
3. **Bildirimler**: Geç kalma, erken çıkış bildirimleri
4. **Dashboard**: Gerçek zamanlı istatistikler
5. **Mesai Hesaplama**: Otomatik fazla mesai hesabı
6. **Vardiya Yönetimi**: Vardiya bazlı takip
7. **Tatil/İzin Entegrasyonu**: İzinli günlerde uyarı

## 📝 Lisans

Bu sistem Ahi Kariyer İK Yönetim Sistemi'nin bir parçasıdır.
© 2025 - Tüm hakları saklıdır.


