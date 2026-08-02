export default function StudioProjectProgress({value, compact = false}: {value: number; compact?: boolean}) {
  return (
    <div className="min-w-0">
      <div className="flex items-center justify-between text-[12px] font-medium text-[#64748b]">
        <span>İlerleme</span><span>%{value}</span>
      </div>
      <div className={`mt-2 overflow-hidden rounded-full bg-[#e8eef4] ${compact ? "h-1" : "h-1.5"}`}>
        <div className="h-full rounded-full bg-[#4f8fac]" style={{width: `${value}%`}} />
      </div>
    </div>
  );
}
