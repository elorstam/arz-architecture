import type {ReactNode} from "react";
import localFont from "next/font/local";
import "./client-portal.css";

const clientFont=localFont({src:[{path:"../../public/fonts/CenturyGothic.woff2",weight:"400",style:"normal"},{path:"../../public/fonts/CenturyGothic.woff",weight:"600",style:"normal"}],display:"swap",fallback:["Arial","Helvetica","sans-serif"],variable:"--font-studio"});

export default function ClientLayout({children}:{children:ReactNode}){
 return <div className={`${clientFont.variable} ${clientFont.className}`}>{children}</div>;
}
