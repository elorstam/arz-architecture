import {redirect} from "next/navigation";

import StudioDashboard from "@/components/studio/StudioDashboard";
import {getStudioContext} from "@/lib/studio/auth/get-studio-context";
import {getStudioLeadSummary} from "@/lib/studio/crm/lead-repository";
import {getStudioQuoteSummary} from "@/lib/studio/quotes/quote-repository";
import {getQuickAccessData} from "@/lib/studio/quick-access/quick-access-repository";
import {getFinanceDashboard} from "@/lib/studio/finance/finance-repository";

export const dynamic = "force-dynamic";

export default async function StudioDashboardPage() {
  const [context, crmSummary, quoteSummary, quickAccess, finance] = await Promise.all([getStudioContext(), getStudioLeadSummary(), getStudioQuoteSummary(), getQuickAccessData(4), getFinanceDashboard()]);
  if (!context?.membership) redirect("/studio/login");

  const organization = Array.isArray(context.membership.organizations)
    ? context.membership.organizations[0]
    : context.membership.organizations;
  const profile = Array.isArray(context.membership.profiles)
    ? context.membership.profiles[0]
    : context.membership.profiles;
  const dateLabel = new Intl.DateTimeFormat("tr-TR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Istanbul",
  }).format(new Date());

  return (
    <StudioDashboard
      userName={profile?.full_name || context.user.email || "ARZ Studio Kullanıcısı"}
      organizationName={organization?.name || "ARZ Mimarlık"}
      dateLabel={dateLabel}
      crmSummary={crmSummary}
      quoteSummary={quoteSummary}
      quickAccess={quickAccess}
      finance={finance}
    />
  );
}
