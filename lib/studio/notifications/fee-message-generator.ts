export type FeeMessageInput = {
  customerName: string;
  projectName: string;
  feeName: string;
  amount: number;
};

const clean = (value: string) => value.normalize("NFC").replace(/[<>]/g, "").trim();
const money = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" });

export function generateFeeWhatsAppMessage(input: FeeMessageInput) {
  if (!Number.isFinite(input.amount) || input.amount <= 0) throw new Error("fee_amount_required");
  const customer = clean(input.customerName) || "Müşterimiz";
  const project = clean(input.projectName);
  const fee = clean(input.feeName);
  if (!project || !fee) throw new Error("fee_message_identity_invalid");

  return `Merhaba Sayın ${customer},

${project} kapsamındaki ${fee} harcı tahakkuk etmiştir.

Ödemeniz gereken tutar:
${money.format(input.amount)}

Tahakkuk belgeniz ekte yer almaktadır.

Ödeme sonrası dekontu bizimle paylaşabilirsiniz.

İyi günler dileriz.

ARZ Mimarlık`;
}

export function validateEditableFeeMessage(value: string) {
  const message = value.normalize("NFC").trim();
  if (message.length < 20 || message.length > 2000 || /[<>]/.test(message)) throw new Error("fee_message_invalid");
  return message;
}
