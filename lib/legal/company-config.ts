export type CompanyLegalConfig = Readonly<{
  legalName?: string; brandName: string; companyType?: string; taxOffice?: string;
  taxNumber?: string; mersisNumber?: string; tradeRegistryNumber?: string;
  registeredAddress?: string; phone?: string; email?: string; legalNoticeEmail?: string;
  kvkkApplicationEmail?: string; kepAddress?: string; websiteUrl: string;
  lastUpdatedAt: string; paymentProvider?: string;
  providers: readonly {name: string; purpose: string; internationalTransfer: "possible" | "domestic"}[];
}>;

const env = (key: string) => process.env[key]?.trim() || undefined;

export const companyLegalConfig = Object.freeze({
  legalName: env("NEXT_PUBLIC_COMPANY_LEGAL_NAME"),
  brandName: "ARZ Mimarlık",
  companyType: env("NEXT_PUBLIC_COMPANY_TYPE"),
  taxOffice: env("NEXT_PUBLIC_COMPANY_TAX_OFFICE"),
  taxNumber: env("NEXT_PUBLIC_COMPANY_TAX_NUMBER"),
  mersisNumber: env("NEXT_PUBLIC_COMPANY_MERSIS_NUMBER"),
  tradeRegistryNumber: env("NEXT_PUBLIC_COMPANY_TRADE_REGISTRY_NUMBER"),
  registeredAddress: env("NEXT_PUBLIC_COMPANY_REGISTERED_ADDRESS"),
  phone: env("NEXT_PUBLIC_COMPANY_PHONE") ?? "+90 542 570 44 29",
  email: env("NEXT_PUBLIC_COMPANY_EMAIL") ?? "info@arzmimarlik.net",
  legalNoticeEmail: env("NEXT_PUBLIC_COMPANY_LEGAL_NOTICE_EMAIL") ?? "info@arzmimarlik.net",
  kvkkApplicationEmail: env("NEXT_PUBLIC_COMPANY_KVKK_EMAIL"),
  kepAddress: env("NEXT_PUBLIC_COMPANY_KEP_ADDRESS"),
  websiteUrl: env("NEXT_PUBLIC_SITE_URL") ?? "https://arzmimarlik.net",
  lastUpdatedAt: env("NEXT_PUBLIC_LEGAL_LAST_UPDATED_AT") ?? "2026-08-04",
  paymentProvider: env("NEXT_PUBLIC_PAYMENT_PROVIDER"),
  providers: [
    {name: "Vercel", purpose: "barındırma ve içerik sunumu", internationalTransfer: "possible"},
    {name: "Supabase", purpose: "veri altyapısı ve güvenli erişim", internationalTransfer: "possible"},
    {name: "Google Analytics 4", purpose: "site kullanım analitiği", internationalTransfer: "possible"},
    {name: "E-posta hizmet sağlayıcısı", purpose: "iletişim ve bildirim", internationalTransfer: "possible"},
  ],
} satisfies CompanyLegalConfig);

export const criticalCompanyFields = ["legalName", "companyType", "taxOffice", "taxNumber", "registeredAddress"] as const;
export const missingCriticalCompanyFields = criticalCompanyFields.filter((key) => !companyLegalConfig[key]);

if (process.env.NODE_ENV === "production" && missingCriticalCompanyFields.length) {
  console.warn(`[legal-config] Eksik kritik şirket bilgileri: ${missingCriticalCompanyFields.join(", ")}`);
}

export function displayCompanyValue(value: string | undefined, label: string) {
  if (value) return value;
  return process.env.NODE_ENV === "development" ? `[${label.toUpperCase()} EKLENECEK]` : "—";
}
