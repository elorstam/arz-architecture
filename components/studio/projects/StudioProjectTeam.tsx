import type {ProjectTeamMember} from "@/components/studio/projects/StudioProjectData";

export default function StudioProjectTeam({members}: {members: ProjectTeamMember[]}) {
  return (
    <section aria-labelledby="team-title" className="rounded-xl border border-[#dedad1] bg-white p-5 shadow-[0_4px_18px_rgba(32,39,46,.03)]">
      <h2 id="team-title" className="text-[13px] font-semibold text-[#2d353b]">Proje Ekibi</h2>
      <div className="mt-4 space-y-3">
        {!members.length?<p className="text-[9px] leading-4 text-[#969792]">Henüz sorumlu kullanıcı atanmadı.</p>:null}
        {members.map((member) => (
          <div key={`${member.name}-${member.role}`} className="flex items-center gap-3">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#f0ece4] text-[8px] font-semibold text-[#7c673f]">{member.initials}</span>
            <div className="min-w-0"><p className="truncate text-[10px] font-semibold text-[#464d51]">{member.name}</p><p className="mt-0.5 truncate text-[8px] text-[#969792]">{member.role}</p></div>
          </div>
        ))}
      </div>
    </section>
  );
}
