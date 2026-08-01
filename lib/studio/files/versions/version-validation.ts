import {z} from "zod";
import {STUDIO_REVISION_REASONS} from "./version-types";
export const versionRevisionSchema=z.object({revisionCode:z.string().trim().max(40,"Revizyon kodu en fazla 40 karakter olabilir."),revisionTitle:z.string().trim().min(1,"Revizyon başlığı zorunludur.").max(160,"Revizyon başlığı en fazla 160 karakter olabilir."),revisionReason:z.enum(STUDIO_REVISION_REASONS).exclude(["initial","rollback"]),revisionNote:z.string().trim().max(4000,"Revizyon notu en fazla 4000 karakter olabilir.")});
