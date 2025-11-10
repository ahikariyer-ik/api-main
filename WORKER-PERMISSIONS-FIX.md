# 🔧 Worker Permissions Hatası - Düzeltme Kılavuzu

## ⚠️ Sorunlar

1. ❌ **Görev durumu güncellenemiyor** → 403 Forbidden
2. ❌ **İzin talebi oluşturulamıyor** → 403 Forbidden

**Sebep:** Strapi Admin Panel'de Worker role'üne gerekli API izinleri verilmemiş.

---

## ✅ ÇÖZÜM: Strapi Admin'de İzinleri Aç

### 1️⃣ Strapi Admin Panel'e Gir
```
http://localhost:1337/admin
```

### 2️⃣ Settings → Users & Permissions Plugin → Roles

### 3️⃣ "Worker" Rolünü Bul ve Tıkla

### 4️⃣ Permissions Bölümünde Şunları AÇ:

#### 📋 TASK (Görevler)
- ✅ `find` - Görevleri görüntüleme
- ✅ `findOne` - Tek görev detayı
- ✅ `update` - Görev güncelleme (DURUM DEĞİŞTİRME İÇİN GEREKLİ!)

**Özel Route:**
- ✅ `my-tasks` - Kendi görevlerimi getir

#### 📅 LEAVE-REQUEST (İzin Talepleri)
- ✅ `find` - İzin taleplerini görüntüleme
- ✅ `findOne` - Tek izin talebi detayı
- ✅ `create` - Yeni izin talebi oluşturma (GEREKLİ!)

**Özel Routes:**
- ✅ Custom route varsa (my-leave-requests gibi)

#### 📁 UPLOAD (Dosya/Belge İndirme)
- ✅ `upload` - Belgeleri görüntülemek için

#### 🏢 DEPARTMENT (Departman - Opsiyonel)
- ✅ `find` - Departman listesi (form'larda gösterilmesi için)

#### 🏪 BRANCH (Şube - Opsiyonel)
- ✅ `find` - Şube listesi

---

## 📸 Ekran Görüntüsü Rehberi

```
Strapi Admin Panel
├── Settings
│   └── Users & Permissions Plugin
│       └── Roles
│           └── Worker
│               └── Permissions
│                   ├── Task
│                   │   ├── ✅ find
│                   │   ├── ✅ findOne
│                   │   ├── ✅ update  ← ÖNEMLİ!
│                   │   └── ✅ my-tasks
│                   │
│                   ├── Leave-request
│                   │   ├── ✅ find
│                   │   ├── ✅ findOne
│                   │   └── ✅ create  ← ÖNEMLİ!
│                   │
│                   ├── Upload
│                   │   └── ✅ upload
│                   │
│                   ├── Department
│                   │   └── ✅ find
│                   │
│                   └── Branch
│                       └── ✅ find
```

---

## 🚨 DİKKAT! Verilmemesi Gereken İzinler

Worker'a şunları **VERME**:

#### ❌ Task
- ❌ `create` - Kendi görev oluşturmasın
- ❌ `delete` - Görev silmesin

#### ❌ Leave-request
- ❌ `update` - İzin talebini kendisi güncelleyemesin (onay için)
- ❌ `delete` - İzin talebini silemesin
- ❌ `approve` - Kendi talebini onaylayamasın
- ❌ `reject` - Kendi talebini reddedememesin

#### ❌ Worker
- ❌ HİÇBİR İZİN VERME - Diğer çalışanları görmesin/düzenlemesin

#### ❌ Company-profile, User, Role, vb.
- ❌ HİÇBİR İZİN VERME - Sistem ayarlarına erişmesin

---

## ✅ İzinler Verdikten Sonra

### 1️⃣ **SAVE** Butonuna Tıkla
Strapi Admin'de "Worker" role sayfasında **en üstteki veya en alttaki SAVE butonuna** bas!

### 2️⃣ **Frontend'i Yenile**
Tarayıcıda `F5` veya Ctrl+R

### 3️⃣ **Test Et**

#### Test 1: Görev Durumu Güncelleme
1. Worker hesabıyla giriş yap
2. **Görevlerim** sayfasına git
3. Bir görevde **"Durum Güncelle"** tıkla
4. Durumu **"Tamamlandı"** yap
5. ✅ **Başarılı!** - 403 hatası almamalısın

#### Test 2: İzin Talebi Oluşturma
1. Worker hesabıyla giriş yap
2. **İzin Taleplerim** sayfasına git
3. **"Yeni İzin Talebi"** tıkla
4. Form doldur ve **"Talep Oluştur"** tıkla
5. ✅ **Başarılı!** - İzin talebi oluşmalı

---

## 🔍 Hala Çalışmıyorsa?

### API Console'u Kontrol Et
Strapi terminalinde hata mesajı var mı?

### Tarayıcı Console'u Kontrol Et
F12 → Console → 403 hatası varsa tam hata mesajını oku

### Worker Role Type'ı Kontrol Et
Worker role'ünün **Type** alanı tam olarak `worker` olmalı (küçük harf)

### Cache Temizle
```bash
# Tarayıcıda
Ctrl + Shift + Delete → Cache'i temizle

# Veya Incognito/Gizli pencere kullan
```

---

## 📋 Minimum Gerekli İzinler (Özet)

```json
{
  "task": {
    "find": true,
    "findOne": true,
    "update": true
  },
  "leave-request": {
    "find": true,
    "findOne": true,
    "create": true
  },
  "upload": {
    "upload": true
  }
}
```

---

## 🎯 Checklist

- [ ] Strapi Admin'e giriş yaptım
- [ ] Settings → Users & Permissions → Roles → Worker
- [ ] Task permissions: find, findOne, update ✅
- [ ] Leave-request permissions: find, findOne, create ✅
- [ ] Upload permissions: upload ✅
- [ ] **SAVE** butonuna bastım
- [ ] Frontend'i yeniledim (F5)
- [ ] Görev durumu güncelleme test edildi ✅
- [ ] İzin talebi oluşturma test edildi ✅

Tüm checklistler tamamlandığında sistem tam çalışır! ✅

