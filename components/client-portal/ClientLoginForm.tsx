"use client";
import {useState} from "react";
import {useRouter} from "next/navigation";
import {StudioInput} from "@/components/studio/ui";
import {studioButtonClass} from "@/components/studio/StudioButton";

export default function ClientLoginForm({next,error}:{next:string;error?:string}){
 const router=useRouter();const[email,setEmail]=useState("");const[password,setPassword]=useState("");const[message,setMessage]=useState(error==="access"?"Bu hesap için aktif müşteri proje erişimi bulunmuyor.":"");const[pending,setPending]=useState(false);
 async function submit(event:React.FormEvent){event.preventDefault();setPending(true);setMessage("");try{const response=await fetch("/api/client/auth/login",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({email,password,next})});const result=await response.json() as{error?:string;destination?:string};if(!response.ok)throw new Error(result.error||"Giriş yapılamadı.");router.replace(result.destination||"/client");router.refresh();}catch(caught){setMessage(caught instanceof Error?caught.message:"Giriş yapılamadı.");}finally{setPending(false);}}
 return <form onSubmit={submit} className="mt-8 space-y-5"><StudioInput id="client-email" label="E-posta" type="email" autoComplete="email" required value={email} onChange={event=>setEmail(event.target.value)}/><StudioInput id="client-password" label="Şifre" type="password" autoComplete="current-password" required value={password} onChange={event=>setPassword(event.target.value)}/><button className={`${studioButtonClass("primary")} w-full justify-center`} disabled={pending}>{pending?"Giriş yapılıyor…":"Giriş Yap"}</button>{message?<p role="alert" className="rounded-xl bg-[#fff1f0] px-4 py-3 text-sm text-[#9f3a38]">{message}</p>:null}</form>;
}
