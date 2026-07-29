# ARZ CMS ZIP 2

Admin panelindeki **✨ AI Oluştur** düğmesi, Türkçe proje taslağından aşağıdaki alanları tek istekte hazırlar:

- Türkçe ve İngilizce URL slug’ları
- Proje başlığı, kategori, hizmetler, kısa açıklama ve detay metinleri
- `tr`, `en`, `de`, `fr`, `es`, `nl`, `ar`, `ja`, `ko`, `zh` çevirileri
- Meta başlık, meta açıklama, anahtar kelimeler ve Open Graph açıklaması
- Kapak ve galeri görselleri için yerelleştirilmiş alt metinler

## Kurulum

1. `.env.example` dosyasını `.env.local` olarak kopyalayın.
2. `OPENAI_API_KEY` değerini ekleyin.
3. İsterseniz varsayılan `gpt-5-mini` modelini `OPENAI_PROJECT_MODEL` ile değiştirin.
4. Mevcut Supabase kurulumunda `supabase/schema.sql` dosyasını yeniden çalıştırın. Bu işlem eksikse `seo` JSONB sütununu ekler.
5. `npm ci` ve `npm run build` komutlarını çalıştırın.

AI uç noktası yalnızca oturum açmış yönetici tarafından kullanılabilir ve dakikada beş istekle sınırlandırılmıştır. AI sonucu önce formda taslak olarak gösterilir; veritabanına ancak **Kaydet** düğmesine basıldığında yazılır.
