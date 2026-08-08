import {notFound, redirect} from "next/navigation";

import ClientProfilePage from "@/components/client-portal/ClientProfilePage";
import {getClientPortalContext} from "@/lib/client-portal/get-client-portal-context";

export default async function ClientProfileRoute({
  searchParams,
}: {
  searchParams: Promise<{
    project?: string | string[];
  }>;
}) {
  const query = await searchParams;

  const selectedProjectId =
    typeof query.project === "string"
      ? query.project
      : undefined;

  const context = await getClientPortalContext(
    selectedProjectId,
  ).catch(() => null);

  if (!context?.user) {
    redirect(
      "/client/login?next=%2Fclient%2Fprofile",
    );
  }

  if (
    !context.membership ||
    !context.project
  ) {
    notFound();
  }

  return (
    <ClientProfilePage
      project={context.project}
      profile={context.profile}
    />
  );
}