# Çalışan Login Sorunu - Kontrol Listesi

## ✅ Yapılması Gerekenler (Sırayla)

### 1. Strapi API'yi Yeniden Başlat
```bash
# Strapi terminalinde Ctrl+C ile durdur
# Sonra yeniden başlat:
cd C:\Users\M3001-4\Desktop\ahikariyer\Ahi-Kariyer\ahikariyer-ik-api-main
npm run develop
```

### 2. Strapi Admin Panel'de Worker Role Kontrolü
1. Tarayıcıda aç: http://localhost:1337/admin
2. Settings → Users & Permissions Plugin → Roles
3. "Worker" rolünü ara
4. **EĞER YOK İSE:**
   - "Add new role" tıkla
   - Name: `Worker`
   - Description: `Çalışan rolü`
   - **ÖNEMLİ:** Type alanına manuel olarak `worker` yaz (küçük harf)

5. **Permissions (İzinler) - Şunları AÇ:**
   - ✅ Worker: find, findOne
   - ✅ Task: find, findOne, update
   - ✅ Leave-request: find, findOne, create, update
   - ✅ Upload: find (belgeleri görmek için)
   - ✅ Department: find
   - ✅ Branch: find
   - Save

### 3. Test Kullanıcısı Oluştur
1. Şirket hesabıyla giriş yap (localhost:3000/login)
2. Çalışanlarım → Yeni Çalışan Ekle
3. Bilgileri doldur:
   ```
   Ad: Test
   Soyad: Worker
   Email: test123@test.com
   Şifre: 123456
   Şifre Tekrar: 123456
   ✅ Kullanıcı hesabı oluştur (AÇIK OLMALI)
   ```
4. Kaydet

### 4. Login Testi
1. Çıkış yap
2. Login sayfası → "Çalışanlar" sekmesi
3. Email: test123@test.com
4. Şifre: 123456
5. Giriş

---

## 🔍 Sorun Devam Ederse

### Strapi Admin'de Kullanıcıyı Manuel Kontrol Et:
1. http://localhost:1337/admin
2. Content Manager → User (Users & Permissions)
3. test123@test.com kullanıcısını bul
4. Kontroller:
   - ✅ Confirmed: true olmalı
   - ✅ Blocked: false olmalı
   - ✅ Role: Worker olmalı

### API Loglarını Kontrol Et:
Strapi terminalinde şu hataları ara:
- "Worker rolü bulunamadı"
- "Email zaten mevcut"
- Password hash hatası

---

## 📝 Notlar
- API'de değişiklik yapıldı, Strapi'nin mutlaka yeniden başlatılması gerekiyor
- Worker role'ün type'ı tam olarak "worker" olmalı (küçük harf)
- Email adresi benzersiz olmalı (daha önce kullanılmamış)

