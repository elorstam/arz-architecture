"use client";

import Image from "next/image";
import {useState} from "react";

export default function PublicPaymentCheckoutButton({token}:{token:string}){
 const [pending,setPending]=useState(false);
 const [message,setMessage]=useState("");
 async function start(){
  if(pending)return;
  setPending(true);setMessage("");
  try{
   const response=await fetch(`/api/payments/public/${encodeURIComponent(token)}/checkout`,{method:"POST",headers:{"Content-Type":"application/json"},body:"{}"});
   const body=await response.json().catch(()=>null)as{checkoutUrl?:string;error?:string}|null;
   if(response.ok&&body?.checkoutUrl){location.assign(body.checkoutUrl);return;}
   setMessage(body?.error??"Ödeme başlatılamadı. Lütfen tekrar deneyin.");
  }catch{setMessage("Ödeme başlatılamadı. Lütfen tekrar deneyin.");}
  finally{setPending(false)}
 }
 return <div className="public-payment-action">
  <button type="button" disabled={pending} onClick={start} className="public-payment-iyzico-button" aria-label={pending?"Ödeme ekranı açılıyor":"iyzico ile Öde"}>
   <Image src="/images/payments/iyzico_ile_ode_horizontal_white.png" alt="iyzico ile Öde" width={267} height={58} priority/>
  </button>
  {message?<p role="status">{message}</p>:null}
 </div>;
}
