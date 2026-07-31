export const QUOTE_STATUSES=["Draft","Sent","Approved","Rejected","Expired","Cancelled","Converted"] as const;
export const QUOTE_CURRENCIES=["TRY","USD","EUR"] as const;
export const QUOTE_DISCOUNT_TYPES=["None","Fixed","Percentage"] as const;
export const QUOTE_UNITS=["Piece","m²","m","Hour","Day","Month","Project","Package","Other"] as const;
export const QUOTE_STATUS_LABELS={Draft:"Taslak",Sent:"Gönderildi",Approved:"Onaylandı",Rejected:"Reddedildi",Expired:"Süresi Doldu",Cancelled:"İptal Edildi",Converted:"Projeye Dönüştürüldü"} as const;
export const QUOTE_UNIT_LABELS={Piece:"Adet","m²":"m²",m:"m",Hour:"Saat",Day:"Gün",Month:"Ay",Project:"Proje",Package:"Paket",Other:"Diğer"} as const;
export const DEFAULT_QUOTE_VALUES={currency:"TRY",discountType:"None",discountValue:"0",taxRate:"20"} as const;
