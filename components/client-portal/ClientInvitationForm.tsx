"use client";

import {useState} from "react";
import {usePathname,useRouter} from "next/navigation";

import {StudioBadge,StudioInput} from "@/components/studio/ui";
import {studioButtonClass} from "@/components/studio/StudioButton";
import {clientNavigationPath} from "@/lib/routing/app-domains";

export default function ClientInvitationForm({token,email}:{token:string;email:string}){
  const router=useRouter();
  const pathname=usePathname();
  const[mode,setMode]=useState<"signup"|"login">("signup");
  const[name,setName]=useState("");const[password,setPassword]=useState("");const[confirm,setConfirm]=useState("");
  const[message,setMessage]=useState("");const[pending,setPending]=useState(false);
  async function submit(event:React.FormEvent){
    event.preventDefault();setMessage("");
    if(mode==="signup"&&password!==confirm){setMessage("Şifreler eşleşmiyor.");return;}
    setPending(true);
    try{
      const response=await fetch("/api/client/invitations/accept",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({token,mode,name,password})});
      const result=await response.json() as{error?:string;destination?:string};
      if(!response.ok)throw new Error(result.error||"Davet kabul edilemedi.");
      router.replace(result.destination||clientNavigationPath("client","/client",pathname));router.refresh();
    }catch(caught){setMessage(caught instanceof Error?caught.message:"Davet kabul edilemedi.");}
    finally{setPending(false);}
  }
  return <form onSubmit={submit} className="client-auth-form mt-7"><div className="flex rounded-xl bg-[#eef3f8] p-1" role="tablist" aria-label="Hesap seçimi"><button type="button" role="tab" aria-selected={mode==="signup"} onClick={()=>{setMode("signup");setMessage("");}} className={`flex-1 rounded-lg px-3 py-2.5 text-sm font-semibold ${mode==="signup"?"bg-white text-[#17232e] shadow-sm":"text-[#64748b]"}`}>Yeni hesap</button><button type="button" role="tab" aria-selected={mode==="login"} onClick={()=>{setMode("login");setMessage("");}} className={`flex-1 rounded-lg px-3 py-2.5 text-sm font-semibold ${mode==="login"?"bg-white text-[#17232e] shadow-sm":"text-[#64748b]"}`}>Mevcut hesap</button></div><div><StudioBadge variant="info">{email}</StudioBadge></div>{mode==="signup"?<StudioInput id="invite-name" label="Ad Soyad" autoComplete="name" maxLength={120} required value={name} onChange={event=>setName(event.target.value)}/>:null}<StudioInput id="invite-password" label={mode==="signup"?"Şifre oluştur":"Şifre"} type="password" autoComplete={mode==="signup"?"new-password":"current-password"} minLength={8} required value={password} onChange={event=>setPassword(event.target.value)} help={mode==="signup"?"En az 8 karakter kullanın.":undefined}/>{mode==="signup"?<StudioInput id="invite-confirm" label="Şifreyi doğrula" type="password" autoComplete="new-password" minLength={8} required value={confirm} onChange={event=>setConfirm(event.target.value)}/>:null}<button className={`${studioButtonClass("primary")} w-full justify-center`} disabled={pending}>{pending?"Doğrulanıyor…":"Daveti Kabul Et"}</button>{message?<p role="alert" className="rounded-xl bg-[#fff1f0] px-4 py-3 text-sm text-[#9f3a38]">{message}</p>:null}</form>;
}
