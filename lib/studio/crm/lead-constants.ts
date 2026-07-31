export const LEAD_STAGES=["Yeni Lead","İlk Görüşme","İhtiyaç Analizi","Teklif Hazırlanıyor","Teklif Gönderildi","Kazanıldı","Kaybedildi"] as const;
export const LEAD_STATUSES=["Aktif","Beklemede","Kapandı"] as const;
export const LEAD_SERVICE_TYPES=["Villa","Konut","Apartman","İç Mimari","Ofis","Ticari","Kentsel Dönüşüm","Render","Danışmanlık","Diğer"] as const;
export const LEAD_SOURCES=["Instagram","Google","Web Sitesi","Referans","Armut","Sahibinden","Telefon","Eski Müşteri","Diğer"] as const;
export const LEAD_CURRENCIES=["TRY","USD","EUR"] as const;
export const DEFAULT_LEAD_VALUES={stage:"Yeni Lead",status:"Aktif",serviceType:"Diğer",source:"Diğer",budgetCurrency:"TRY"} as const;
export const TERMINAL_LEAD_STAGES=["Kazanıldı","Kaybedildi"] as const;
