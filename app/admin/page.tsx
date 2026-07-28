import {isAdmin} from '@/lib/admin-auth'; import AdminLogin from '@/components/admin/AdminLogin'; import AdminDashboard from '@/components/admin/AdminDashboard';
export const dynamic='force-dynamic';
export default async function AdminPage(){return <main className="theme-dark-surface min-h-screen bg-[#0b0b0b] text-white">{await isAdmin()?<AdminDashboard/>:<AdminLogin/>}</main>}
