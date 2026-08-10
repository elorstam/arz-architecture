"use client";

import {useCallback, useEffect, useState, useTransition} from "react";
import {createPortal} from "react-dom";

import {permanentlyDeleteProjectAction, preparePermanentProjectDeletionAction} from "@/app/studio/(protected)/projects/actions";
import {studioButtonClass} from "@/components/studio/StudioButton";
import {StudioIcon} from "@/components/studio/StudioIcons";

const reasons = ["Test projesi", "Yanlış oluşturuldu", "Mükerrer", "Müşteri iptal etti", "Diğer"] as const;
const relations = ["Proje", "Dosyalar ve versiyonları", "Render Arşivi", "Finans ve tahsilatlar", "Resmî süreçler", "Görevler ve kilometre taşları", "AI kullanım ilişkileri", "Timeline, favoriler ve son açılanlar", "Thumbnail kayıtları", "Projeye bağlı diğer ilişkiler"] as const;

export default function ProjectPermanentDeleteDialog({projectId, projectName, triggerClassName = ""}: {projectId: string; projectName: string; triggerClassName?: string}) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [confirmation, setConfirmation] = useState("");
  const [reason, setReason] = useState("");
  const [deletionToken, setDeletionToken] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const confirmationMatches = confirmation.trim().toLocaleLowerCase("tr-TR") === projectName.trim().toLocaleLowerCase("tr-TR");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!deleteOpen) return;
    const html = document.documentElement;
    const body = document.body;
    const previousHtmlOverflow = html.style.overflow;
    const previousBodyOverflow = body.style.overflow;
    const previousBodyPaddingRight = body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - html.clientWidth;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`;
    return () => {
      html.style.overflow = previousHtmlOverflow;
      body.style.overflow = previousBodyOverflow;
      body.style.paddingRight = previousBodyPaddingRight;
    };
  }, [deleteOpen]);

  const closeDialog = useCallback(() => {
    if (pending) return;
    setDeleteOpen(false);
    setStep(1);
    setConfirmation("");
    setReason("");
    setDeletionToken("");
    setError("");
  }, [pending]);

  useEffect(() => {
    if (!deleteOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeDialog();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [closeDialog, deleteOpen]);

  function prepareDeletion() {
    if (!confirmationMatches || pending) return;
    setError("");
    startTransition(async () => {
      const result = await preparePermanentProjectDeletionAction(projectId, projectName);
      if (result.ok) {
        setDeletionToken(result.token);
        setStep(2);
      } else setError(result.message);
    });
  }

  function confirmDeletion() {
    if (!deletionToken || pending) return;
    setError("");
    startTransition(async () => {
      const result = await permanentlyDeleteProjectAction(projectId, deletionToken, reason);
      if (result?.ok === false) setError(result.message);
    });
  }

  const portal = deleteOpen && mounted ? createPortal(
    <div className="project-permanent-delete-layer">
      <div className="project-permanent-delete-overlay" onClick={closeDialog} aria-hidden="true" />
      <section
        className="project-permanent-delete-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-permanent-delete-title"
        aria-describedby="project-permanent-delete-warning"
        onClick={event => event.stopPropagation()}
      >
        <header className="project-permanent-delete-header">
          <span className="project-permanent-delete-header__icon" aria-hidden="true"><StudioIcon name="close" className="h-5 w-5" /></span>
          <div className="min-w-0 flex-1"><h2 id="project-permanent-delete-title">Kalıcı Sil</h2><p id="project-permanent-delete-warning">Bu işlem geri alınamaz.</p></div>
          <button type="button" onClick={closeDialog} disabled={pending} aria-label="Kalıcı silme penceresini kapat">×</button>
        </header>
        <div className="project-permanent-delete-content">
          {step === 1 ? <>
            <p>Aşağıdaki proje ilişkileri kalıcı olarak kaldırılacaktır:</p>
            <ul>{relations.map(item => <li key={item}>• {item}</li>)}</ul>
            <label>Devam etmek için proje adını yazın<input autoFocus value={confirmation} onChange={event => setConfirmation(event.target.value)} aria-describedby="project-delete-name-help" /><span id="project-delete-name-help">Birebir eşleşme gerekir: {projectName}</span></label>
            <label>Silme nedeni (isteğe bağlı)<select value={reason} onChange={event => setReason(event.target.value)}><option value="">Belirtilmedi</option>{reasons.map(value => <option key={value}>{value}</option>)}</select></label>
          </> : <p><strong>“{projectName}”</strong> projesi ve bağlı tüm kayıtlar kalıcı olarak silinecek. Bu işlem geri alınamaz.</p>}
          {error ? <p role="alert" className="project-permanent-delete-content__error">{error}</p> : null}
        </div>
        <footer className="project-permanent-delete-footer">
          <button type="button" onClick={closeDialog} disabled={pending} className={studioButtonClass("secondary", "md")}>İptal</button>
          {step === 1 ? <button type="button" onClick={prepareDeletion} disabled={!confirmationMatches || pending} className={studioButtonClass("destructive", "md")}>{pending ? "Hazırlanıyor…" : "Kalıcı Sil"}</button> : <button type="button" onClick={confirmDeletion} disabled={!deletionToken || pending} className={studioButtonClass("destructive", "md")}>{pending ? "Siliniyor…" : "Kalıcı Olarak Sil"}</button>}
        </footer>
      </section>
    </div>,
    document.body,
  ) : null;

  return <><button type="button" onClick={() => setDeleteOpen(true)} className={studioButtonClass("danger", "sm", triggerClassName)} aria-haspopup="dialog"><StudioIcon name="close" className="h-4 w-4" />Kalıcı Sil</button>{portal}</>;
}
