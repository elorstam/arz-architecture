"use client";
import {useRouter}from"next/navigation";import{useState}from"react";
export default function StudioLogoutButton(){const router=useRouter();const[loading,setLoading]=useState(false);async function logout(){setLoading(true);await fetch("/api/studio/auth/logout",{method:"POST"}).catch(()=>null);router.replace("/studio/login");router.refresh();}return <button onClick={logout} disabled={loading} className="border border-white/20 px-4 py-2 text-xs uppercase tracking-[.16em] text-white/65 hover:text-white">{loading?"Çıkılıyor…":"Çıkış"}</button>}
