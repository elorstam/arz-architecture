import {redirect} from "next/navigation";

import AdminLogin from "@/components/admin/AdminLogin";
import {isAdmin} from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{reason?: string}>;
}) {
  if (await isAdmin()) redirect("/admin");
  const {reason} = await searchParams;
  return (
    <main className="theme-dark-surface min-h-screen bg-[#0b0b0b] text-white">
      <AdminLogin idle={reason === "idle"} />
    </main>
  );
}
