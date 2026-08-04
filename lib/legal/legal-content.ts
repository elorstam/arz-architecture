// Yayımlanmadan önce şirket bilgileri ve hukuki hükümler yetkili hukuk danışmanı tarafından kontrol edilmelidir.
export const legalSlugs = [
  "on-bilgilendirme-formu", "mesafeli-hizmet-sozlesmesi", "iptal-cayma-iade-kosullari",
  "hizmet-teslim-ve-ifa-kosullari", "kvkk-aydinlatma-metni", "gizlilik-ve-cerez-politikasi",
  "odeme-ve-guvenlik", "ticari-bilgiler",
] as const;
export type LegalSlug = (typeof legalSlugs)[number];
export type LegalSection = {id: string; title: string; paragraphs: readonly string[]; review?: boolean};
export type LegalDocument = {title: string; shortTitle: string; description: string; sections: readonly LegalSection[]};

const section = (title: string, paragraphs: string[], review = false): LegalSection => ({
  id: title.toLocaleLowerCase("tr-TR").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ı/g, "i").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""), title, paragraphs, review,
});
const generic = (title: string) => `${title}, onaylanan teklif ve proje özel şartlarıyla birlikte değerlendirilir. Somut işlem öncesinde kapsam, tutar ve tarihler müşteriye açıkça sunulur.`;

export const legalDocuments: Record<LegalSlug, LegalDocument> = {
  "on-bilgilendirme-formu": {title:"Ön Bilgilendirme Formu",shortTitle:"Ön Bilgilendirme",description:"Mimarlık ve danışmanlık hizmetleri için işlem öncesi genel bilgilendirme şablonu.",sections:[
    section("Sağlayıcının kimliği ve iletişim bilgileri",["Sağlayıcının güncel ticari ve iletişim bilgileri aşağıdaki şirket kartında yer alır."]),
    ...["Hizmetin temel nitelikleri","Hizmet bedeli","İndirim","KDV dahil/hariç durumu","KDV oranı ve tutarı","Genel toplam","Ödeme yöntemi","Hizmetin ifa ve teslim şekli","Tahmini süre"].map(x=>section(x,[generic(x),"Bu genel şablonda işleme özgü değer bulunmaz; ileride ödeme öncesi teklif özeti/snapshot ile ayrıca gösterilecektir."])),
    section("Cayma hakkı",["Tüketicinin cayma hakkı, işlemin niteliği ve hizmete başlanıp başlanmadığı dikkate alınarak yürürlükteki mevzuata göre değerlendirilir."],true),
    section("Cayma hakkının istisnaları",["Varsa istisna, müşterinin açık talebi ve somut hizmetin niteliği doğrulanmadan uygulanmaz."],true),
    ...["İptal/iade yöntemi","Şikâyet ve başvuru kanalları","Uyuşmazlık çözümü","Müşteri teyidi"].map(x=>section(x,[generic(x)])),
  ]},
  "mesafeli-hizmet-sozlesmesi": {title:"Mesafeli Hizmet Sözleşmesi",shortTitle:"Mesafeli Hizmet Sözleşmesi",description:"Mimarlık ve danışmanlık hizmetlerine özgü genel mesafeli sözleşme çerçevesi.",sections:[
    ...["Taraflar","Tanımlar","Sözleşmenin konusu","Hizmet kapsamı","Teklif ve proje özel şartlarının önceliği","Bedel, KDV ve indirim","Kapora ve hakedişler","Ödeme yöntemi","Hizmetin başlama şartları","Müşterinin bilgi/belge sağlama yükümlülüğü","Revizyon kapsamı","Teslim ve ifa"].map(x=>section(x,[generic(x)])),
    section("Cayma hakkı",["Cayma hakkının kapsamı ve kullanımı müşteri sıfatı, sözleşme türü ve yürürlükteki mevzuata göre belirlenir."],true),
    section("Hizmet ifasına başlanması halinde uygulanacak hükümler",["Cayma süresi içinde hizmete başlanması, yalnız müşterinin mevzuata uygun açık talebi/onayı alınarak ve sonuçları bildirilerek değerlendirilir."],true),
    ...["İptal ve iade","Fikri mülkiyet ve kullanım hakları","Gizlilik ve kişisel veriler","Mücbir sebep","Bildirimler","Uyuşmazlık","Yürürlük"].map(x=>section(x,[generic(x)],true)),
  ]},
  "iptal-cayma-iade-kosullari": {title:"İptal, Cayma ve İade Koşulları",shortTitle:"İptal ve İade",description:"Hizmetin aşamasına göre iptal, cayma ve iade süreçlerinin genel çerçevesi.",sections:[
    section("Ödeme öncesi iptal",["Ödeme tamamlanmadan önce teklif kabul edilmemişse müşteri işlemi durdurabilir."]),
    section("Kapora sonrası fakat hizmet başlamadan iptal",["Fiilen başlanmayan hizmette iade; belgelenebilir işlem maliyetleri, sözleşme ve emredici hükümler dikkate alınarak değerlendirilir."],true),
    section("Hizmete başlandıktan sonra iptal",["Tamamlanan iş, ayrılan kaynak ve hakedişler şeffaf biçimde hesaplanır; kalan tutarın iadesi somut dosyaya göre belirlenir."],true),
    ...["Tamamlanmış aşamalar","Müşteriye özel hazırlanmış çalışmalar","Hakediş bazlı ödeme"].map(x=>section(x,[generic(x)],true)),
    section("Yanlış veya mükerrer ödeme",["Doğrulanan yanlış ya da mükerrer ödeme için müşteri gecikmeden bilgilendirilir ve iade süreci başlatılır."]),
    section("İade yöntemi",["Kartla alınan tutar, teknik ve hukuki olarak mümkün olduğu ölçüde aynı ödeme aracına iade edilir. Nakit veya farklı hesaba yönlendirme talepleri güvenlik kontrolüne tabidir."]),
    section("İade süresi",["Kesin süre, ödeme sağlayıcısı ve banka işlem süreleri doğrulandıktan sonra işlem bazında bildirilir."],true),
    ...["Kart iadelerinin ödeme aracına yapılması","Talep kanalı","Gerekli bilgi ve belgeler"].map(x=>section(x,[generic(x)])),
  ]},
  "hizmet-teslim-ve-ifa-kosullari": {title:"Hizmet Teslim ve İfa Koşulları",shortTitle:"Hizmet Teslim Koşulları",description:"Mimarlık hizmetlerinin proje aşamaları, süreleri ve teslim kanalları.",sections:[
    section("Hizmetin dijital ve/veya fiziksel ifası",["Hizmet; toplantı, saha çalışması, danışmanlık, dijital dosya veya kararlaştırılmış basılı çıktı yoluyla ifa edilebilir."]),
    section("Proje aşamaları",["Aşamalar, kilometre taşları ve kabul ölçütleri teklifte belirtilir."]),
    section("Teslim biçimleri",["Teslim; kapsamına göre PDF, DWG, görsel, rapor veya basılı doküman içerebilir. Kaynak dosya teslimi ayrıca kararlaştırılır."]),
    section("Client Portal üzerinden teslim",["Yetkilendirilen dosyalar güvenli Client Portal alanında müşteriye sunulabilir."]),
    section("E-posta veya güvenli indirme",["Dosya boyutu ve gizlilik düzeyine göre e-posta ya da süreli/güvenli indirme bağlantısı kullanılabilir."]),
    ...["Tahmini süreler","Müşteriden kaynaklanan gecikmeler","Resmî kurum/belediye süreçlerinden kaynaklanan süreler","Revizyon süreleri","Teslimin kabulü","Eksik/ayıplı ifa bildirimi","Mücbir sebepler"].map(x=>section(x,[generic(x)])),
  ]},
  "kvkk-aydinlatma-metni": {title:"KVKK Aydınlatma Metni",shortTitle:"KVKK",description:"Kişisel verilerin faaliyet bazlı işlenmesi hakkında aydınlatma metni.",sections:[
    section("Veri sorumlusu",["Veri sorumlusunun doğrulanmış ticari bilgileri şirket kartında yayımlanır."]),
    section("İşlenen kişisel veri kategorileri",["Kimlik, iletişim, müşteri işlem, finans, proje/taşınmaz, işlem güvenliği, hukuki işlem ve talep/şikâyet verileri; yalnız ilgili faaliyet gerektirdiği ölçüde işlenebilir."]),
    section("Toplama yöntemleri",["Veriler web formları, e-posta, telefon, toplantı, sözleşme/teklif, Client Portal ve teknik günlükler üzerinden otomatik veya otomatik olmayan yollarla toplanabilir."]),
    section("İşleme amaçları ve hukuki sebepler",["Teklif ve sözleşme süreçleri; sözleşmenin kurulması/ifası. Faturalama ve resmî yükümlülükler; hukuki yükümlülük. Güvenlik ve uyuşmazlık yönetimi; meşru menfaat veya hakkın tesisi. İzne bağlı iletişim/analitik; gerekli olduğu durumda açık rıza."],true),
    section("Aktarım yapılan taraf kategorileri",["Yetkili kamu kurumları, mali/hukuki danışmanlar, barındırma, veri altyapısı, e-posta ve analitik hizmet sağlayıcıları ile; amaçla sınırlı ve gerekli güvenceyle paylaşım yapılabilir."]),
    section("Yurt dışı aktarım",["Altyapı sağlayıcılarının veri konumu ve aktarım mekanizmaları aşağıdaki sağlayıcı listesine göre sözleşme öncesi doğrulanmalıdır. Kesin bir ‘aktarım yoktur’ beyanı verilmemektedir."],true),
    section("Saklama süreleri veya belirleme kriterleri",["Süreler; sözleşme ilişkisi, yasal yükümlülük, zamanaşımı, uyuşmazlık ve işleme amacının sona ermesi kriterlerine göre veri kategorisi bazında belirlenir."],true),
    section("Teknik/idari tedbirler",["Erişim yetkilendirmesi, parola ve oturum kontrolleri, TLS, kayıt/log incelemesi, yedekleme, tedarikçi değerlendirmesi ve personel farkındalığı gibi ölçülü tedbirler uygulanır."]),
    section("KVKK madde 11 kapsamındaki haklar",["İlgili kişiler; verilerinin işlenip işlenmediğini öğrenme, bilgi talep etme, düzeltme/silme isteme, aktarılan taraflara bildirim, sonuca itiraz ve zarar halinde giderim talebi haklarını mevzuattaki şartlarla kullanabilir."]),
    section("Başvuru yöntemi",["Başvurular kimlik doğrulamaya elverişli bilgi ve talep açıklamasıyla KVKK iletişim kanalına iletilir. Usul ve yanıt süreleri yayımdan önce hukuk danışmanıyla doğrulanmalıdır."],true),
    section("İletişim bilgileri",["Güncel başvuru kanalları aşağıdaki şirket kartında yer alır."]),
  ]},
  "gizlilik-ve-cerez-politikasi": {title:"Gizlilik ve Çerez Politikası",shortTitle:"Gizlilik ve Çerez",description:"Web sitesi gizliliği, kullanılan çerezler ve analitik hizmetler hakkında politika.",sections:[
    section("Site üzerinde toplanan bilgiler",["Ziyaret ve cihaz bilgileri, güvenlik günlükleri, form iletileri ve kullanıcı tarafından sağlanan iletişim bilgileri işlevin gerektirdiği ölçüde toplanabilir."]),
    section("Zorunlu çerezler",["Dil, oturum, güvenlik ve temel site işlevleri için gerekli çerezler kullanılabilir."]),
    section("Analitik çerezler",["Sitede Google Analytics 4 kullanılmaktadır. Ölçümün ürettiği tanımlayıcılar ve ayarlar mevcut yapılandırmaya bağlıdır; yayımdan önce çerez taramasıyla doğrulanmalıdır."],true),
    section("Tercih çerezleri",["Dil veya görünüm tercihini hatırlayan kayıtlar yalnız ilgili özellik kullanıldığında oluşabilir."]),
    section("Pazarlama çerezleri",["Mevcut uygulamada doğrulanmış bir pazarlama çerezi listelenmemektedir. Yeni araç eklenirse politika ve gerekli tercih mekanizması güncellenir."]),
    section("Üçüncü taraf hizmet sağlayıcıları",["Barındırma, analitik, veri altyapısı ve e-posta sağlayıcıları sınırlı teknik verilere erişebilir."]),
    ...["Çerez süreleri","Tarayıcı ayarları","Çerez tercihleri","Güvenlik tedbirleri","Politika değişiklikleri","İletişim"].map(x=>section(x,[generic(x)],x==="Çerez süreleri")),
  ]},
  "odeme-ve-guvenlik": {title:"Ödeme ve Güvenlik",shortTitle:"Ödeme ve Güvenlik",description:"Planlanan online tahsilat modeli ve ödeme güvenliği ilkeleri.",sections:[
    section("Ödeme altyapısı",["Online tahsilat özelliği devreye alındığında ödemeler, seçilecek lisanslı ödeme kuruluşunun güvenli altyapısı üzerinden alınacaktır. Henüz aktif bir sağlayıcı ilan edilmemektedir."]),
    section("Kart verileri",["ARZ Mimarlık kart numarası veya CVV saklamayacaktır; kart verileri ödeme kuruluşunun güvenli ödeme ekranında işlenecektir."]),
    section("SSL/TLS",["Site ile bağlantı aktarım sırasında SSL/TLS ile korunur."]),
    section("3D Secure",["Seçilen sağlayıcı ve işlem desteklediğinde 3D Secure doğrulaması kullanılacaktır."]),
    section("Tahsilat modeli",["Teklif, kapora, hakediş ve tek kullanımlık ödeme bağlantısı modeli planlanmaktadır; bu sayfa ödeme işlevinin aktif olduğu anlamına gelmez."]),
    ...["KDV dahil/hariç fiyat sunumu","İndirim sunumu","Para birimi","Mükerrer ödeme","Şüpheli işlem kontrolü","İade işlemi","İletişim"].map(x=>section(x,[generic(x)])),
  ]},
  "ticari-bilgiler": {title:"Ticari Bilgiler",shortTitle:"Ticari Bilgiler",description:"ARZ Mimarlık marka, şirket ve iletişim bilgilerinin merkezi kaydı.",sections:[]},
};

export function isLegalSlug(value: string): value is LegalSlug { return legalSlugs.includes(value as LegalSlug); }
