# Resume Chatbot 🤖

Interaktif özgeçmiş chatbot'u - Ziyaretçiler soru sorar, AI özgeçmiş bilgilerine göre cevap verir.

## Özellikler

- 💬 Gemini AI destekli sohbet
- 📋 Özgeçmiş bilgilerinden otomatik cevap
- 📧 Ziyaretçi bilgisi email bildirimi
- 🎨 Modern, responsive tasarım
- ⚡ Nuxt 3 + Vue 3 + TypeScript

## Kurulum

### 1. Bağımlılıkları yükle

```bash
npm install
```

### 2. Environment değişkenlerini ayarla

```bash
cp .env.example .env
```

`.env` dosyasını düzenle:

```env
GEMINI_API_KEY=your_gemini_api_key
RESEND_API_KEY=your_resend_api_key  # opsiyonel
NOTIFICATION_EMAIL=your@email.com
```

### 3. Geliştirme sunucusunu başlat

```bash
npm run dev
```

`http://localhost:3000` adresinde çalışacak.

## API Key'leri Nereden Alınır?

### Gemini API (Zorunlu)
1. [Google AI Studio](https://aistudio.google.com/app/apikey) adresine git
2. "Create API Key" butonuna tıkla
3. Key'i kopyala ve `.env` dosyasına yapıştır

### Resend API (Opsiyonel - Email bildirimi için)
1. [Resend](https://resend.com) adresinde ücretsiz hesap oluştur
2. Dashboard'dan API Key al
3. Ücretsiz planda günde 100 email gönderebilirsin

## Vercel'e Deploy

### 1. GitHub'a push et

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/resume-chatbot.git
git push -u origin main
```

### 2. Vercel'de import et

1. [Vercel](https://vercel.com) hesabı oluştur (GitHub ile giriş yap)
2. "Add New Project" → GitHub reposunu seç
3. Environment Variables ekle:
   - `GEMINI_API_KEY`
   - `RESEND_API_KEY` (opsiyonel)
   - `NOTIFICATION_EMAIL`
4. Deploy!

## Kendi Bilgilerini Eklemek

`data/resume.json` dosyasını kendi özgeçmiş bilgilerinle düzenle.

## Proje Yapısı

```
resume-chatbot/
├── pages/
│   └── index.vue          # Ana sayfa + chat UI
├── server/
│   └── api/
│       ├── chat.post.ts   # Gemini API endpoint
│       └── notify.post.ts # Email bildirim endpoint
├── data/
│   └── resume.json        # Özgeçmiş bilgileri
├── assets/
│   └── css/
│       └── main.css       # Global stiller
└── nuxt.config.ts         # Nuxt konfigürasyonu
```

## Lisans

MIT
