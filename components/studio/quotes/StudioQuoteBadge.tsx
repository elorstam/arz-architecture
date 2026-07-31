import {QUOTE_STATUS_LABELS} from "@/lib/studio/quotes/quote-constants";
import type {QuoteStatus} from "@/lib/studio/quotes/quote-types";
export default function StudioQuoteBadge({status}:{status:QuoteStatus}){return <span className="inline-flex rounded-full border border-[#d9d1c1] bg-[#f5f1e9] px-2.5 py-1 text-[9px] font-medium text-[#786541]">{QUOTE_STATUS_LABELS[status]}</span>;}
