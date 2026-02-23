# 🕌 Hadis Akademi

10. Sınıf Hadis Dersi için interaktif web uygulaması.

## ✨ Özellikler
- 🌙 **Günün Hadisi** – Arapça + Türkçe, sesli okuma desteği
- 🎯 **Quiz Sistemi** – 3 tür: çoktan seçmeli, boşluk doldurma, eşleştirme
- 🏅 **Gamification** – Puan sistemi, 10 rozet, seri takibi
- 📊 **İlerleme Takibi** – Haftalık grafikler, doğruluk oranı
- 👨‍🏫 **Öğretmen Paneli** – Tüm öğrencilerin istatistikleri
- 🏆 **Sıralama** – Haftalık lider tablosu

---

## 🚀 Kurulum (3 Adım)

### Adım 1 – MongoDB kur (eğer kurulu değilse)
→ https://www.mongodb.com/try/download/community indir, kur ve çalıştır.

### Adım 2 – Backend kur ve çalıştır
```powershell
cd C:\Users\Mustafa\kodlar\hadis-akademi\backend
npm install
npm run seed        # Hadisleri ve demo kullanıcıları yükler
npm run dev         # Backend başlar → http://localhost:5000
```

### Adım 3 – Frontend kur ve çalıştır (YENİ terminal)
```powershell
cd C:\Users\Mustafa\kodlar\hadis-akademi\frontend
npm install
npm run dev         # Frontend başlar → http://localhost:3000
```

### Adım 4 – Tarayıcıda aç
→ **http://localhost:3000** adresine git

---

## 🎓 Demo Giriş Bilgileri

| Rol | E-posta | Şifre |
|-----|---------|-------|
| 🎓 Öğrenci | ogrenci@demo.com | 123456 |
| 👨‍🏫 Öğretmen | ogretmen@demo.com | 123456 |

---

## 📁 Proje Yapısı

```
hadis-akademi/
├── backend/
│   ├── config/db.js          # MongoDB bağlantısı
│   ├── models/               # User, Hadith, QuizAttempt, Badge, SharedExample
│   ├── routes/               # auth, hadiths, quiz, progress, badges, leaderboard, teacher
│   ├── middleware/auth.js    # JWT koruması
│   ├── seed.js               # Demo veriler
│   └── server.js             # Express sunucusu
└── frontend/
    └── src/
        ├── context/AuthContext.jsx
        ├── services/api.js
        ├── components/Sidebar.jsx
        ├── pages/
        │   ├── LoginPage.jsx
        │   ├── HomePage.jsx       # Günün hadisi
        │   ├── HadithListPage.jsx
        │   ├── QuizPage.jsx
        │   ├── BadgesPage.jsx
        │   ├── LeaderboardPage.jsx
        │   ├── ProgressPage.jsx
        │   └── TeacherPage.jsx
        └── index.css             # Tasarım sistemi
```

## 🛠️ Teknoloji Stack

| Katman | Teknoloji |
|--------|-----------|
| Frontend | React 18 + Vite |
| Backend | Node.js + Express |
| Veritabanı | MongoDB + Mongoose |
| Auth | JWT |
| Grafikler | Recharts |
| Yazı tipi | Inter + Amiri (Arapça) |
