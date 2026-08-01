"use client";

import { useActionState, useTransition } from "react";
import { archiveTagAction, createTagAction, updateTagAction, type TagActionState } from "@/app/studio/(protected)/settings/tags/actions";
import { studioButtonClass } from "@/components/studio/StudioButton";
import { STUDIO_TAG_COLORS } from "@/lib/studio/tags/tag-colors";
import type { StudioTag } from "@/lib/studio/tags/tag-types";
import StudioTagBadge from "./StudioTagBadge";

const initialState: TagActionState = { success: false, message: "" };
const archiveConfirmation =
  "Bu etiket arşivlenecek. Mevcut kayıt bağlantıları korunacak ancak yeni atamalarda görünmeyecek.";

function TagForm({ tag }: { tag?: StudioTag }) {
  const [state, action, pending] = useActionState(
    tag ? updateTagAction.bind(null, tag.id) : createTagAction,
    initialState,
  );

  return (
    <form action={action} className="grid gap-3 sm:grid-cols-[1fr_140px_1fr_auto]">
      <input
        name="name"
        required
        maxLength={60}
        defaultValue={tag?.name}
        placeholder="Etiket adı"
        aria-label="Etiket adı"
        className="h-11 rounded-lg border px-3 text-sm"
      />
      <select
        name="color"
        defaultValue={tag?.color ?? "gray"}
        aria-label="Etiket rengi"
        className="h-11 rounded-lg border px-3 text-sm"
      >
        {STUDIO_TAG_COLORS.map((color) => (
          <option key={color}>{color}</option>
        ))}
      </select>
      <input
        name="description"
        maxLength={500}
        defaultValue={tag?.description ?? ""}
        placeholder="Açıklama"
        aria-label="Etiket açıklaması"
        className="h-11 rounded-lg border px-3 text-sm"
      />
      <button disabled={pending} className={studioButtonClass(tag ? "secondary" : "primary")}>
        {tag ? "Düzenle" : "Yeni Etiket"}
      </button>
      {state.message ? (
        <p role="status" className="text-sm sm:col-span-4">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}

export default function StudioTagManager({ tags }: { tags: StudioTag[] }) {
  const [isPending, startTransition] = useTransition();

  function changeArchiveState(tag: StudioTag) {
    if (!tag.isArchived && !window.confirm(archiveConfirmation)) return;
    startTransition(() => archiveTagAction(tag.id, !tag.isArchived));
  }

  return (
    <div className="space-y-5">
      <section className="rounded-xl border bg-white p-5">
        <h2 className="text-xl font-semibold">Yeni Etiket</h2>
        <div className="mt-4">
          <TagForm />
        </div>
      </section>
      {tags.map((tag) => (
        <article key={tag.id} className="rounded-xl border bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <StudioTagBadge tag={tag} />
              <p className="mt-2 text-sm text-[#69716f]">
                {tag.description || "Açıklama yok"} · {tag.usageCount} kullanım
              </p>
            </div>
            <button
              type="button"
              disabled={isPending}
              className={studioButtonClass(tag.isArchived ? "secondary" : "outline", "sm")}
              onClick={() => changeArchiveState(tag)}
            >
              {tag.isArchived ? "Geri Al" : "Arşivle"}
            </button>
          </div>
          <div className="mt-4 border-t pt-4">
            <TagForm tag={tag} />
          </div>
        </article>
      ))}
    </div>
  );
}
