export default function StudioProjectProgress({value, compact = false}: {value: number; compact?: boolean}) {
  return (
    <div className="min-w-0">
      <div className="flex items-center justify-between text-[8px] font-medium text-[#92938e]">
        <span>İlerleme</span><span>%{value}</span>
      </div>
      <div className={`mt-2 overflow-hidden rounded-full bg-[#eae7e0] ${compact ? "h-1" : "h-1.5"}`}>
        <div className="h-full rounded-full bg-[#a98f5e]" style={{width: `${value}%`}} />
      </div>
    </div>
  );
}
