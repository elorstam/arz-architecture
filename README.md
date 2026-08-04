This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## ARZ Studio Core: temel kurulum

Studio, mevcut uygulama içinde `/studio` altında çalışır. Public site ve mevcut
CMS oturum sistemi değişmeden kalır; Studio oturumları Supabase Auth çerezleri,
JWT ve PostgreSQL RLS ile korunur.

1. `.env.example` dosyasını `.env.local` olarak kopyalayın ve Studio
   değişkenlerini doldurun.
2. `supabase/rollbacks/001_studio_core_foundation.sql` dosyasını Supabase SQL
   Editor veya mevcut migration aracınızla uygulayın.
3. Supabase Authentication ayarlarında **public signup** özelliğini kapatın.
4. Authentication yöntemi olarak email/password kullanın. İlk owner bootstrap
   scripti kullanıcıyı doğrulanmış olarak oluşturur. İleride eklenecek davetli
   kullanıcılar için email confirmation açık tutulması önerilir.
5. Supabase Redirect URLs listesine geliştirme için
   `http://localhost:3000/studio/auth/callback`, production için
   `https://arzmimarlik.net/studio/auth/callback` adresini ekleyin.
6. İlk organizasyonu ve owner hesabını yalnız sunucuda oluşturun:

```bash
npm run studio:bootstrap-owner
```

Bootstrap, sistemde aktif bir owner varsa veritabanı seviyesinde reddedilir.
Komut tamamlandıktan sonra `STUDIO_OWNER_PASSWORD` değerini deployment
ortamından kaldırın. Password reset arayüzü bu ilk dilime dahil değildir ve
sonraki auth/davet aşamasına bırakılmıştır.

Geri dönüş için önce bu sürümde oluşan Studio verilerini yedekleyin, ardından
`supabase/rollbacks/001_studio_core_foundation.rollback.sql` dosyasını kontrollü
olarak çalıştırın. Rollback yalnız yeni Studio tablolarını hedefler; CMS
tablolarına dokunmaz.

## ZIP 3 proje migration ve merkezi çeviri düzeltmesi

1. `.env.local` içinde `NEXT_PUBLIC_SUPABASE_URL` ve `SUPABASE_SERVICE_ROLE_KEY` değerlerini tanımlayın.
2. Supabase SQL Editor içinde güncel `supabase/schema.sql` dosyasını çalıştırın. Şema idempotenttir ve mevcut veriyi silmez.
3. Eski `data/projects.ts` kaynağındaki bütün projeleri bir kez aktarmak için `npm run migrate:projects` çalıştırın.
4. Migration `slug_tr` alanına göre upsert yapar; tekrar çalıştırılması aynı projeleri çoğaltmaz. Görsel yolları, galeri, çeviriler, SEO, kategori, yıl, konum, öne çıkarma ve yayın durumu korunur.
5. Admin panelindeki **Site Çevirileri** ekranında **Eksik sabit metinleri seed et** düğmesini kullanın. Seed mevcut çevirileri değiştirmez ve tekrar çalıştırılabilir.

Her locale rotası sunucu tarafında merkezi çeviri verisini okur. Eksik tekil anahtarlarda ve eksik proje/blog çevirilerinde Türkçe kaynak içerik gösterilir.

## ARZ CMS ZIP 3 kurulumu

1. `.env.example` dosyasını `.env.local` olarak kopyalayın.
2. Supabase SQL Editor içinde güncel `supabase/schema.sql` dosyasını çalıştırın. Migration idempotenttir ve mevcut proje verilerini silmez.
3. `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY` değerlerini tanımlayın.
4. Medya kütüphanesi için `media` bucket şema tarafından otomatik oluşturulur.
5. AI Kullanımı paneli için normal proje anahtarından ayrı bir organization Admin API Key oluşturup `OPENAI_ADMIN_KEY` olarak tanımlayın.
6. Başlangıç kredisi tahmini için `OPENAI_INITIAL_CREDIT_USD` değerini girin. Panelde kaydedilen bütçe ayarı bu başlangıç değerinin yerini alır.
7. `npm ci` ve `npm run build` çalıştırın.

ZIP 3; blog, ortak Supabase medya kütüphanesi, görsel analizli AI alt metin, merkezi site çevirileri ve admin-only OpenAI kullanım/bütçe paneli içerir. Google Website Translator tamamen kaldırılmıştır; uygulama yalnızca gerçek locale rotaları ve sunucu tarafı içerikleri kullanır. Kullanım maliyetleri OpenAI organization Costs API verisidir; “tahmini kalan bakiye” başlangıç kredisi eksi bu ayın maliyeti olarak hesaplanır ve kesin fatura bakiyesi değildir.

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

### 5 dakikalık hareketsizlik zaman aşımı

Yönetici oturumu yalnız admin panelinde izlenir. Fare, klavye, kaydırma veya
dokunma etkileşimi olmadan 5 dakika geçtiğinde HttpOnly oturum çerezi sunucu
logout endpoint'i üzerinden temizlenir ve kullanıcı
`/admin/login?reason=idle` adresine yönlendirilir. Aktivite zamanlayıcıyı
sıfırlar; diğer açık admin sekmeleri BroadcastChannel ve localStorage
olaylarıyla aynı anda oturumdan çıkarılır. Public sayfalar etkilenmez.

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

## ARZ CMS: Supabase + AI + Çoklu Dil + SEO

Bu sürüm iki modda çalışır:

- Supabase değişkenleri yoksa mevcut `data/admin-projects.json` dosya sistemi kullanılmaya devam eder.
- Supabase değişkenleri tanımlıysa proje kayıtları `public.projects`, görseller `project-images` bucket'ında saklanır.

### Supabase kurulumu

1. Supabase projesi oluşturun.
2. SQL Editor içinde `supabase/schema.sql` dosyasını çalıştırın.
3. `.env.example` dosyasını `.env.local` olarak kopyalayın.
4. `NEXT_PUBLIC_SUPABASE_URL` ve `SUPABASE_SERVICE_ROLE_KEY` değerlerini girin.
5. Uygulamayı yeniden başlatın.

Service role anahtarını hiçbir zaman tarayıcı koduna veya GitHub'a koymayın. Bu projede yalnızca sunucu tarafında kullanılır.

### AI çeviri

`OPENAI_API_KEY` ve isteğe bağlı `OPENAI_TRANSLATION_MODEL` tanımlandığında `/api/ai/translate` admin-korumalı çeviri uç noktası aktif olur. Uç nokta proje nesnesinin yapısını, görsel yollarını ve yılları koruyarak desteklenen 10 dile JSON çeviri üretir.

### Çoklu dil veri modeli

Supabase'deki `translations` alanı JSONB'dir. `tr`, `en`, `de`, `fr`, `es`, `nl`, `ja`, `zh`, `ko`, `ar` anahtarları altında tam proje nesneleri saklanabilir. Bir dil henüz üretilmemişse sistem İngilizce içeriğe geri döner.

### SEO

Sitemap artık CMS'teki yayınlanmış projelerden dinamik oluşturulur. Her proje için canonical, hreflang, Open Graph ve Twitter metadata üretilir. Site URL'si `NEXT_PUBLIC_SITE_URL` üzerinden yönetilir.
