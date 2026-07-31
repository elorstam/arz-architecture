"use client";

import {useRouter} from "next/navigation";
import {useState} from "react";
import {StudioIcon} from "@/components/studio/StudioIcons";
import {StudioButtonSpinner,studioButtonClass} from "@/components/studio/StudioButton";

export default function StudioLogoutButton({compact = false}: {compact?: boolean}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function logout() {
    setLoading(true);
    await fetch("/api/studio/auth/logout", {method: "POST"}).catch(() => null);
    router.replace("/studio/login");
    router.refresh();
  }

  return (
    <button type="button" onClick={logout} disabled={loading}
      aria-label={loading ? "Çıkış yapılıyor" : "Çıkış yap"} title="Çıkış yap"
      aria-busy={loading}
      className={compact
        ? "grid h-9 w-9 shrink-0 place-items-center rounded-lg text-white/45 transition-colors hover:bg-white/[.08] hover:text-white disabled:opacity-50"
        : studioButtonClass("outline", "sm")}>
      {loading?<StudioButtonSpinner/>:<StudioIcon name="logout" className="h-[17px] w-[17px]" />}
      {!compact ? <span>{loading ? "Çıkış yapılıyor…" : "Çıkış yap"}</span> : null}
    </button>
  );
}
