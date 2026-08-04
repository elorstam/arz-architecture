import Link from "next/link";
import PremiumFooter from "@/components/PremiumFooter";
import {companyLegalConfig as company, displayCompanyValue} from "@/lib/legal/company-config";
import type {LegalDocument} from "@/lib/legal/legal-content";
import PrintButton from "./PrintButton";
import styles from "./LegalPage.module.css";

const labels: [string,string|undefined][] = [
  ["Marka adı",company.brandName],["Resmî ticari unvan",company.legalName],["Şirket türü",company.companyType],
  ["Vergi dairesi",company.taxOffice],["Vergi numarası",company.taxNumber],["MERSİS",company.mersisNumber],
  ["Ticaret sicili",company.tradeRegistryNumber],["Açık adres",company.registeredAddress],["Telefon",company.phone],
  ["E-posta",company.email],["Hukuki bildirim",company.legalNoticeEmail],["KVKK başvurusu",company.kvkkApplicationEmail],
  ["KEP",company.kepAddress],["Web sitesi",company.websiteUrl],
];

export default function LegalPage({document, locale}:{document:LegalDocument;locale:string}) {
  const date = new Intl.DateTimeFormat("tr-TR",{dateStyle:"long",timeZone:"Europe/Istanbul"}).format(new Date(`${company.lastUpdatedAt}T12:00:00+03:00`));
  return <main className={styles.page}>
    {locale!=="tr"&&<p className={styles.fallback} lang="tr">Bu sayfada Türkçe canonical yasal metin sunulmaktadır; Türkçe metin geçerlidir.</p>}
    <div className={styles.shell} lang="tr">
      <nav aria-label="İçerik yolu" className={styles.breadcrumb}><Link href={`/${locale}`}>Ana Sayfa</Link> <span aria-hidden> / </span> <span>Yasal</span> <span aria-hidden> / </span> <span aria-current="page">{document.shortTitle}</span></nav>
      <header className={styles.header}><p className={styles.eyebrow}>ARZ Mimarlık · Yasal</p><h1 className={styles.title}>{document.title}</h1><p className={styles.description}>{document.description}</p><div className={styles.meta}><span>Son güncelleme: <time dateTime={company.lastUpdatedAt}>{date}</time></span><PrintButton /></div></header>
      <div className={styles.grid}>
        <nav aria-label="İçindekiler" className={styles.toc}><p className={styles.tocTitle}>İçindekiler</p><ol>{document.sections.map((s,i)=><li key={s.id}><a href={`#${s.id}`}>{i+1}. {s.title}</a></li>)}<li><a href="#sirket-bilgileri">Şirket ve iletişim bilgileri</a></li></ol></nav>
        <article className={styles.article}>{document.sections.map((s,i)=><section id={s.id} className={styles.section} key={s.id}><h2>{i+1}. {s.title}</h2>{s.paragraphs.map(p=><p key={p}>{p}</p>)}{s.review&&<aside className={styles.review}>Hukuki inceleme gerekli: Bu bölüm somut hizmet, müşteri sıfatı ve güncel mevzuata göre yetkili hukuk danışmanı tarafından doğrulanmalıdır.</aside>}</section>)}
          <section id="sirket-bilgileri" className={styles.card}><h2>Şirket ve iletişim bilgileri</h2><dl className={styles.details}>{labels.map(([label,value])=><div key={label}><dt>{label}</dt><dd>{displayCompanyValue(value,label)}</dd></div>)}</dl>
          {document.title==="KVKK Aydınlatma Metni"&&<div className={styles.providers}><h3>Yapılandırılmış sağlayıcı kategorileri</h3><table className={styles.table}><tbody>{company.providers.map(p=><tr key={p.name}><th>{p.name}</th><td>{p.purpose}; yurt dışı aktarım ihtimali yayımdan önce doğrulanacaktır.</td></tr>)}</tbody></table></div>}</section>
        </article>
      </div>
    </div><PremiumFooter />
  </main>;
}
