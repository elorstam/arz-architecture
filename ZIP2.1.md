# ARZ CMS ZIP 2.1

AI üretimi uzun süren tek bir istek yerine dayanıklı aşamalara ayrılmıştır:

1. Türkçe proje içeriği, Türkçe SEO ve Türkçe/İngilizce slug üretilir.
2. Dokuz çeviri dili üçerli gruplar halinde üretilir.
3. Başarılı sonuçlar formda korunur ve işlem tamamlanır.

Her OpenAI isteğinin zaman aşımı 180 saniyedir. Türkçe içerik isteği en fazla 4.000, üç dilli çeviri isteği en fazla 5.000 çıktı tokenı kullanır.

OpenAI çıktıları kesin JSON Schema ile istenir ve sunucuda yeniden doğrulanır. Eksik, bozuk veya şemayla uyumsuz çıktı aynı grup için bir kez otomatik yeniden denenir.

Bir çeviri grubu başarısız olursa önceki başarılı gruplar silinmez. Admin panelindeki **Başarısız dilleri yeniden dene** düğmesi yalnızca eksik dilleri tekrar gönderir. AI sonucu veritabanına ancak kullanıcı **Kaydet** düğmesine bastığında yazılır.
