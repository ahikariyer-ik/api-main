# PDKS QR Scan Sayfası Erişim Sorunu - Düzeltme

## Sorun

Worker rolündeki kullanıcılar backend panelinde "PDKS QR Okut" menüsüne tıkladığında sayfa açılmıyor ve otomatik olarak worker-dashboard'a yönlendiriliyor.

## Sebep

Backend middleware dosyasında (`ahikariyer-ik-backend-main/src/middleware.ts`), worker'ların erişebileceği sayfalar listesinde `/pdks-scan` path'i tanımlı değildi. Middleware, worker'ı bu listedeki sayfalara yönlendirme izni verdiği için, `/pdks-scan` sayfasına erişim engelliyordu.

## Yapılan Düzeltmeler

### 1. Middleware Güncellendi

**Dosya:** `ahikariyer-ik-backend-main/src/middleware.ts`

**Değişiklik:**
```typescript
// ÖNCE:
const workerAllowedPaths = [
  '/worker-dashboard',
  '/worker-tasks', 
  '/worker-leave-requests'
]

// SONRA:
const workerAllowedPaths = [
  '/worker-dashboard',
  '/worker-tasks', 
  '/worker-leave-requests',
  '/pdks-scan'  // ✅ EKLENDİ
]
```

### 2. PDKS Scan Sayfası Import Hatası Düzeltildi

**Dosya:** `ahikariyer-ik-backend-main/src/app/(dashboard)/(private)/pdks-scan/page.tsx`

**Değişiklik:**
- Yanlış import olan `FormControlRadioButton` kaldırıldı (MUI'de böyle bir component yok)
- `FormControlLabel` zaten import edilmişti, onu kullanıyor

## Backend'i Yeniden Başlatma

Değişikliklerin etkili olması için backend'i yeniden başlatmanız gerekiyor:

```bash
cd ahikariyer-ik-backend-main
npm run dev
```

## Test Adımları

1. **Backend'i başlatın:**
   ```bash
   cd ahikariyer-ik-backend-main
   npm run dev
   ```

2. **Worker hesabı ile giriş yapın:**
   - Browser'da `http://localhost:3001` adresine gidin
   - Worker email ve şifresi ile giriş yapın

3. **PDKS QR Okut menüsüne tıklayın:**
   - Sol menüde "PDKS QR Okut" butonuna tıklayın
   - Sayfa başarıyla açılmalı

4. **QR Kod okutma test edin:**
   - "Giriş" veya "Çıkış" seçin
   - "QR Kod Okutmaya Başla" butonuna tıklayın
   - Kamera izni verin
   - QR kodu okutun

## Worker için Erişilebilir Sayfalar

Middleware'de tanımlı worker sayfalari:
- ✅ `/worker-dashboard` - Ana sayfa
- ✅ `/worker-tasks` - Görevlerim
- ✅ `/worker-leave-requests` - İzin taleplerim
- ✅ `/pdks-scan` - PDKS QR Okut (YENİ!)

## Navigation Menüsü

Worker'ın görebileceği menü öğeleri (`src/navigation/vertical/index.ts`):
```typescript
{
  title: 'Ana Sayfa',
  icon: 'tabler-home',
  path: '/worker-dashboard',
  visible: () => authService.isWorker()
},
{
  title: 'İzin Taleplerim',
  icon: 'tabler-calendar',
  path: '/worker-leave-requests',
  visible: () => authService.isWorker()
},
{
  title: 'Görevlerim',
  icon: 'tabler-clipboard-list',
  path: '/worker-tasks',
  visible: () => authService.isWorker()
},
{
  title: 'PDKS QR Okut',
  icon: 'tabler-qrcode',
  path: '/pdks-scan',
  visible: () => authService.isWorker()
}
```

## Önemli Notlar

1. **Middleware Yeniden Başlatma:** Middleware değişiklikleri için backend'i mutlaka yeniden başlatın
2. **Cache Temizleme:** Browser cache'ini temizlemek gerekebilir (Ctrl+Shift+Delete)
3. **Cookie Kontrolü:** Worker olarak giriş yaptığınızdan emin olun
4. **Role Kontrolü:** User'ın `role.type === 'worker'` olmalı

## Hata Durumları

### "Kamera erişimi reddedildi"
- **Çözüm:** Browser ayarlarından kamera iznini etkinleştirin

### "QR kod geçersiz"
- **Sebep:** QR kod süresi dolmuş veya geçersiz
- **Çözüm:** Company hesabı ile yeni QR kod oluşturun

### "Giriş yapmanız gerekiyor"
- **Sebep:** Token geçersiz veya expired
- **Çözüm:** Logout yapıp tekrar giriş yapın

### Sayfa hala açılmıyor
1. Backend'i tamamen durdurup yeniden başlatın
2. Browser cache'ini temizleyin
3. Logout yapıp tekrar login olun
4. Developer Console'da hata var mı kontrol edin

## Teknik Detaylar

### Middleware Çalışma Mantığı

1. User giriş yapar ve token cookie'de saklanır
2. Her sayfa isteğinde middleware çalışır
3. User'ın rolü kontrolü edilir:
   - Worker ise → `workerAllowedPaths` listesi kontrol edilir
   - Listede yoksa → `/worker-dashboard`'a yönlendirilir
   - Listede varsa → Sayfa gösterilir

### QRScanner Component

- html5-qrcode kütüphanesi kullanır
- Kamera erişimi ister
- QR kod okur ve parent component'e callback yapar
- Otomatik olarak scanner'ı durdurur

## Güvenlik

- Worker'lar sadece kendi sayfalarına erişebilir
- Middleware seviyesinde kontrol yapılır
- Diğer sayfalara erişim otomatik engellenir
- Navigation menüsü rolüne göre dinamik oluşturulur

## Destek

Sorun devam ederse:
1. Browser Console loglarını kontrol edin
2. Network sekmesinde redirect olup olmadığına bakın
3. Cookie'de user bilgisini kontrol edin
4. Middleware loglarını inceleyin





