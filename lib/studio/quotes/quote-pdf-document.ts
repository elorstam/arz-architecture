import type {Content,StyleDictionary,TDocumentDefinitions} from "pdfmake/interfaces";
import {QUOTE_STATUS_LABELS,QUOTE_UNIT_LABELS} from "./quote-constants.ts";
import type {StudioQuote} from "./quote-types.ts";

function money(value:string,currency:string){return new Intl.NumberFormat("tr-TR",{style:"currency",currency,minimumFractionDigits:2}).format(Number(value));}
function cell(value:string,style?:string):Content{return{text:value||"-",style,margin:[0,5,0,5]};}
export function buildQuotePdfDefinition(quote:StudioQuote,organizationName:string):TDocumentDefinitions{
 const styles:StyleDictionary={title:{fontSize:22,bold:true,color:"#1c2731"},eyebrow:{fontSize:8,bold:true,color:"#9a8253",characterSpacing:1.5},heading:{fontSize:11,bold:true,color:"#273138",margin:[0,18,0,8]},small:{fontSize:8,color:"#747a7c"},tableHeader:{fontSize:7,bold:true,color:"#ffffff",fillColor:"#18222d"},tableCell:{fontSize:7,color:"#394246"},total:{fontSize:9,bold:true,color:"#1f2930"}};
 const itemRows=quote.items.map((item,index)=>[cell(String(index+1),"tableCell"),cell(item.serviceName,"tableCell"),cell(item.description,"tableCell"),cell(`${item.quantity} ${QUOTE_UNIT_LABELS[item.unit]}`,"tableCell"),cell(money(item.unitPrice,quote.currency),"tableCell"),cell(money(item.lineTotal,quote.currency),"tableCell")]);
 return{pageSize:"A4",pageMargins:[40,48,40,52],styles,defaultStyle:{font:"Roboto",fontSize:9,color:"#465055"},
  header:(current,pageCount)=>({text:`${quote.quoteNumber}  ·  ${current}/${pageCount}`,alignment:"right",margin:[0,20,40,0],fontSize:7,color:"#9a9c99"}),
  footer:{text:organizationName,alignment:"center",margin:[0,14,0,0],fontSize:7,color:"#a5a39d"},
  content:[
   {columns:[{stack:[{text:organizationName.toLocaleUpperCase("tr-TR"),style:"eyebrow"},{text:"TEKLİF",style:"title",margin:[0,7,0,0]}]},{width:170,stack:[{text:quote.quoteNumber,bold:true,alignment:"right"},{text:`Düzenlenme: ${quote.createdAtLabel}`,style:"small",alignment:"right",margin:[0,5,0,0]},{text:`Geçerlilik: ${quote.validUntilLabel||"Belirtilmedi"}`,style:"small",alignment:"right"},{text:`Durum: ${QUOTE_STATUS_LABELS[quote.status]}`,style:"small",alignment:"right"}]}]},
   {text:"MÜŞTERİ",style:"heading"},{table:{widths:["*","*"],body:[[cell(quote.client.name),cell(quote.client.company)],[cell(quote.client.phone),cell(quote.client.email)],[cell([quote.client.city,quote.client.district].filter(Boolean).join(" / ")),cell("")]]},layout:"lightHorizontalLines"},
   {text:"HİZMET KALEMLERİ",style:"heading"},{table:{headerRows:1,widths:[20,90,"*",65,70,70],body:[[cell("Sıra","tableHeader"),cell("Hizmet","tableHeader"),cell("Açıklama","tableHeader"),cell("Miktar","tableHeader"),cell("Birim Fiyat","tableHeader"),cell("Toplam","tableHeader")],...itemRows]},layout:{hLineColor:()=>"#dedad1",vLineColor:()=>"#e6e2da",paddingLeft:()=>5,paddingRight:()=>5}},
   {columns:[{text:""},{width:230,margin:[0,16,0,0],table:{widths:["*",90],body:[[cell("Ara Toplam"),cell(money(quote.subtotal,quote.currency))],[cell("İndirim"),cell(`- ${money(quote.discountTotal,quote.currency)}`)],[cell(`KDV (%${quote.taxRate})`),cell(money(quote.taxTotal,quote.currency))],[cell("GENEL TOPLAM","total"),cell(money(quote.grandTotal,quote.currency),"total")]]},layout:"lightHorizontalLines"}]},
   {text:"ÖDEME KOŞULLARI",style:"heading"},{text:quote.paymentTerms||"Belirtilmedi",fontSize:8,lineHeight:1.4},
   {text:"NOTLAR",style:"heading"},{text:quote.notes||"Not bulunmuyor.",fontSize:8,lineHeight:1.4},
  ]};
}
export function quotePdfFileName(quoteNumber:string){return`${quoteNumber.replace(/[^A-Za-z0-9-]/g,"-")}-teklif.pdf`;}
