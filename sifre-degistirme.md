# 🔐 Çalışan Şifre Değiştirme Özelliği

## ✅ Özellik Eklendi

Artık şirket yöneticileri, çalışanların şifrelerini unuttuğunda **Çalışan Düzenle** sayfasından yeni şifre belirleyebilir.

---

## 📖 Nasıl Kullanılır?

### 1️⃣ Çalışan Listesine Git
- Şirket hesabıyla giriş yap
- Sol menüden **"Çalışanlarım"** tıkla

### 2️⃣ Düzenle Butonuna Tıkla
- Şifresini değiştirmek istediğin çalışanın satırında **kalem (✏️) ikonuna** tıkla

### 3️⃣ Şifre Değiştir
- Sayfanın en altında **"Şifre Değiştir"** bölümünü bul
- **Switch'i aç** (sarı renkte)
- 2 alan açılacak:
  - **Yeni Şifre:** Yeni şifreyi gir (minimum 6 karakter)
  - **Yeni Şifre Tekrar:** Aynı şifreyi tekrar gir

### 4️⃣ Güncelle
- Formu doldurmaya devam et veya sadece şifre değişikliğini kaydet
- **"Güncelle"** butonuna tıkla
- ✅ Şifre başarıyla değiştirildi!

---

## 🔍 Özellikler

### ✅ Güvenlik
- Şifre minimum 6 karakter olmalı
- Şifreler güvenli bir şekilde hash'lenerek saklanır
- Sadece şirket yöneticisi kendi çalışanlarının şifresini değiştirebilir

### ✅ Esneklik
- Şifre değiştirme **opsiyonel**
- Switch açık değilse, şifre değiştirilmez
- Diğer bilgileri güncellerken şifreyi değiştirmene gerek yok

### ✅ Kullanım Senaryosu
**Çalışan:** "Patron, şifremi unuttum!"
**Yönetici:** 
1. Çalışan listesine git
2. İlgili çalışanı düzenle
3. "Şifre Değiştir" aç
4. Yeni şifre: 123456
5. Güncelle
6. **Çalışana söyle:** "Yeni şifren: 123456"

---

## ⚠️ Önemli Notlar

### Şifre Değiştirme Sadece Kullanıcı Hesabı Olan Çalışanlar İçin
- Çalışan oluşturulurken **"Kullanıcı hesabı oluştur"** seçeneği açık olmalıydı
- Eğer çalışanın kullanıcı hesabı yoksa, şifre değiştirilemez
- Bu durumda çalışanı yeniden oluşturman veya manuel user hesabı oluşturman gerekir

### Strapi API'yi Yeniden Başlat
API'de değişiklik yaptık. Mutlaka yeniden başlat:
```bash
# Strapi terminalinde Ctrl+C
npm run develop
```

---

## 🧪 Test Et

1. Mevcut bir çalışanın şifresini değiştir
2. Çıkış yap
3. Çalışan hesabıyla yeni şifreyle giriş yap
4. ✅ Başarılı!

---

## 📸 Ekran Görüntüsü Rehberi

### Şifre Değiştirme Bölümü (Kapalı):
```
┌─────────────────────────────────────────┐
│ ⚪ Şifre Değiştir (Çalışan şifresini   │
│    unuttuğunda kullanın)                │
└─────────────────────────────────────────┘
```

### Şifre Değiştirme Bölümü (Açık):
```
┌─────────────────────────────────────────┐
│ 🟠 Şifre Değiştir (Çalışan şifresini   │
│    unuttuğunda kullanın)                │
│                                         │
│ ┌──────────────┐  ┌──────────────┐    │
│ │ Yeni Şifre   │  │ Yeni Şifre   │    │
│ │ 123456       │  │ Tekrar       │    │
│ │              │  │ 123456       │    │
│ └──────────────┘  └──────────────┘    │
│ Minimum 6 karakter                     │
└─────────────────────────────────────────┘
```

---

## 🎯 Özet

✅ Çalışan şifresi unutulduğunda şirket yöneticisi yeni şifre belirleyebilir
✅ Güvenli şifre hash'leme
✅ Kolay kullanım (switch aç, şifre gir, güncelle)
✅ Opsiyonel özellik (istersen kullan, istersen kullanma)

Şimdi çalışanların şifrelerini kolayca sıfırlayabilirsin! 🎉

