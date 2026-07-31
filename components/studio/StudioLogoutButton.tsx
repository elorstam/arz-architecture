"use client";

import {useRouter} from "next/navigation";
import {useState} from "react";
import {StudioIcon} from "@/components/studio/StudioIcons";

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
      className={compact
        ? "grid h-9 w-9 shrink-0 place-items-center rounded-lg text-white/35 transition-colors hover:bg-white/[.06] hover:text-white disabled:opacity-50"
        : "flex items-center gap-2 rounded-lg border border-white/15 px-4 py-2 text-xs text-white/65 hover:border-white/30 hover:text-white disabled:opacity-50"}>
      <StudioIcon name="logout" className="h-[17px] w-[17px]" />
      {!compact ? <span>{loading ? "Çıkış yapılıyor…" : "Çıkış yap"}</span> : null}
    </button>
  );
}
