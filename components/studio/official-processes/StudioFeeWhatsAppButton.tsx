"use client";
import { useState, useTransition } from "react";
import { generateFeeWhatsAppMessageAction, sendFeeAssessmentWhatsAppAction } from "@/app/studio/(protected)/projects/[projectId]/official-processes/actions";
import { studioButtonClass } from "@/components/studio/StudioButton";

type Props = {
  id: string;
  hasAssessment: boolean;
  configured: boolean;
  customerName: string;
  customerPhone: string;
  projectName: string;
  feeName: string;
  amount: number | null;
  assessmentName: string | null;
};

export default function StudioFeeWhatsAppButton(props: Props) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [result, setResult] = useState("");
  const [pending, start] = useTransition();
  const [generating, startGenerating] = useTransition();
  const reason = !props.amount || props.amount <= 0 ? "Manuel harç tutarını girin." : !props.hasAssessment ? "Tahakkuk belgesi bağlı değil." : !props.customerPhone ? "Müşteri telefon numarası bulunmuyor." : !props.configured ? "WhatsApp henüz yapılandırılmadı." : "";
  function preview() { setResult(""); startGenerating(async () => { const response = await generateFeeWhatsAppMessageAction(props.id); if (!response.success) { setResult(response.error ?? "AI mesajı oluşturulamadı."); return; } setMessage(response.message); setOpen(true); }); }

  return <>
    <button type="button" disabled={Boolean(reason) || generating} title={reason || undefined} aria-describedby={reason ? `fee-ai-reason-${props.id}` : undefined} onClick={preview} className={studioButtonClass("secondary", "sm")}>{generating ? "AI mesajı hazırlanıyor…" : "AI Mesaj Oluştur"}</button>
    {reason ? <span id={`fee-ai-reason-${props.id}`} className="sr-only">{reason}</span> : null}
    {!open && result ? <span role="alert" className="w-full text-sm text-red-700">{result}</span> : null}
    {open ? <div role="dialog" aria-modal="true" aria-labelledby={`fee-ai-title-${props.id}`} className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-xl bg-white p-5 shadow-xl sm:p-6">
        <h3 id={`fee-ai-title-${props.id}`} className="text-xl font-semibold">AI WhatsApp Mesaj Önizlemesi</h3>
        <dl className="mt-4 grid gap-3 rounded-lg bg-[#f8f6f1] p-4 text-sm sm:grid-cols-2">
          <div><dt className="font-semibold">Gönderilecek müşteri</dt><dd className="mt-1 break-words">{props.customerName || "—"}</dd></div>
          <div><dt className="font-semibold">Telefon</dt><dd className="mt-1">{props.customerPhone || "—"}</dd></div>
          <div className="sm:col-span-2"><dt className="font-semibold">Tahakkuk PDF’i</dt><dd className="mt-1 break-all">{props.assessmentName ?? "Belge bağlı değil"}</dd></div>
        </dl>
        <label className="mt-4 grid gap-2 text-sm font-semibold">Düzenlenebilir mesaj
          <textarea value={message} onChange={(event) => setMessage(event.target.value)} maxLength={2000} className="min-h-72 w-full rounded-lg border p-3 text-[15px] font-normal leading-6" />
        </label>
        <p className="mt-2 text-right text-sm text-slate-600" aria-live="polite">{message.length} / 2000 karakter</p>
        {result ? <p role="alert" className="mt-3 text-sm text-red-700">{result}</p> : null}
        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <button type="button" onClick={() => setOpen(false)} className={studioButtonClass("ghost", "sm")}>İptal</button>
          <button type="button" disabled={pending || message.trim().length < 20} onClick={() => start(async () => { const response = await sendFeeAssessmentWhatsAppAction(props.id, message); setResult(response.message); if (response.success) setOpen(false); })} className={studioButtonClass("primary", "sm")}>WhatsApp ile Gönder</button>
        </div>
      </div>
    </div> : null}
  </>;
}
