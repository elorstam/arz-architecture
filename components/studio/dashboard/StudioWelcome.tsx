function firstName(name: string) {
  return name.trim().split(/\s+/)[0] || "Kullanıcı";
}

export default function StudioWelcome({userName, organizationName, dateLabel}: {
  userName: string;
  organizationName: string;
  dateLabel: string;
}) {
  return (
    <header className="flex flex-col justify-between gap-5 border-b border-[#ddd8ce] pb-7 sm:flex-row sm:items-end">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[.18em] text-[#9a8253]">{organizationName}</p>
        <h1 className="mt-2.5 text-[27px] font-semibold tracking-[-.04em] text-[#1e272f] sm:text-[31px]">
          Hoş geldiniz, {firstName(userName)}.
        </h1>
        <p className="mt-2 max-w-2xl text-[13px] leading-6 text-[#747875]">
          Bugün iki onay, bir geciken revizyon ve hazırlanması gereken bir teklif var.
        </p>
      </div>
      <div className="sm:text-right">
        <p className="text-[10px] uppercase tracking-[.14em] text-[#a09d95]">Bugün</p>
        <p className="mt-1.5 text-[12px] font-medium capitalize text-[#555c61]">{dateLabel}</p>
      </div>
    </header>
  );
}
