This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Admin paneli

1. `.env.example` dosyasını `.env.local` adıyla kopyalayın.
2. `ADMIN_PASSWORD` ve `ADMIN_SECRET` değerlerini değiştirin.
3. Uygulamayı yeniden başlatın ve `/admin` adresine gidin.

Admin panelinden Türkçe/İngilizce proje içerikleri, slug, sıralama, yayın durumu, kapak ve galeri görselleri yönetilebilir. Veriler `data/admin-projects.json`, yüklenen görseller `public/uploads/projects` altında tutulur.

> Bu dosya tabanlı sürüm yerel geliştirme ve kalıcı disk sunan Node.js/VPS hosting içindir. Vercel gibi salt-okunur/geçici dosya sistemli sunucusuz platformlarda kalıcı yönetim için Supabase veya başka bir veritabanı/depolama servisine geçilmelidir.

## Admin yedekleme ve Google Authenticator

Admin panelinde **Yedek indir** düğmesi proje kayıtlarını, `public/uploads/projects` altındaki görselleri ve Google Authenticator 2FA durumunu tek ZIP dosyasında toplar. **Yedek yükle** aynı ZIP'i başka bir bilgisayarda geri yükler.

> Yedek dosyası 2FA gizli anahtarını içerdiği için parola gibi korunmalıdır.

İlk `/admin` girişinde:

1. `.env.local` içindeki `ADMIN_PASSWORD` ile devam edin.
2. Google Authenticator uygulamasında **Kurulum anahtarı gir** seçeneğini açın.
3. Panelde gösterilen anahtarı, hesap adı olarak `ARZ Mimarlık Admin` yazarak ve **Zamana dayalı** türünü seçerek ekleyin.
4. Uygulamanın verdiği 6 haneli kodu girerek kurulumu tamamlayın.

Sonraki girişlerde hem yönetici şifresi hem de 6 haneli Authenticator kodu gerekir. Telefon kaybolursa sunucudaki `data/admin-security.json` dosyasını silip uygulamayı yeniden başlatarak 2FA kurulumunu yeniden başlatabilirsiniz. Bu işlemden önce yedek alınması önerilir.
