'use client';
import {useState} from 'react';
import ProjectsAdmin from '@/components/admin/ProjectsAdmin';
import BlogAdmin from '@/components/admin/BlogAdmin';
import MediaAdmin from '@/components/admin/MediaAdmin';
import SiteTranslationsAdmin from '@/components/admin/SiteTranslationsAdmin';
import AiUsageAdmin from '@/components/admin/AiUsageAdmin';
import AdminIdleLogout from '@/components/admin/AdminIdleLogout';
type Tab = 'projects' | 'blog' | 'media' | 'translations' | 'usage';
const tabs: Array<{id: Tab; label: string}> = [
  {id: 'projects', label: 'Projeler'}, {id: 'blog', label: 'Blog'}, {id: 'media', label: 'Medya'},
  {id: 'translations', label: 'Site Çevirileri'}, {id: 'usage', label: 'AI Kullanımı'},
];
export default function AdminDashboard() {
  const [tab, setTab] = useState<Tab>('projects');
  return <div><AdminIdleLogout/><nav className="sticky top-0 z-[100] flex flex-wrap gap-1 border-b border-white/10 bg-[#0b0b0b]/95 px-4 py-3 backdrop-blur">
    {tabs.map((item) => <button key={item.id} onClick={() => setTab(item.id)} className={`px-4 py-2 text-sm ${tab === item.id ? 'bg-white text-black' : 'text-white/60 hover:bg-white/10 hover:text-white'}`}>{item.label}</button>)}
  </nav>
  {tab === 'projects' && <ProjectsAdmin/>}{tab === 'blog' && <BlogAdmin/>}{tab === 'media' && <MediaAdmin/>}
  {tab === 'translations' && <SiteTranslationsAdmin/>}{tab === 'usage' && <AiUsageAdmin/>}</div>;
}
