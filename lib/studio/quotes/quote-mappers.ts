import {QUOTE_CURRENCIES} from "./quote-constants.ts";
import type {QuoteCurrency,QuoteDiscountType,QuoteStatus,QuoteTotals,QuoteUnit,StudioQuote,StudioQuoteInput,StudioQuoteItem,StudioQuoteSummary} from "./quote-types.ts";
export type StudioQuoteItemRow={id:string;sort_order:number;service_name:string;description:string;quantity:string;unit:string;unit_price:string;line_total:string};
export type StudioQuoteRow={id:string;organization_id:string;lead_id:string;quote_number:string;title:string;status:string;currency:string;subtotal:string;
 discount_type:string;discount_value:string;discount_total:string;tax_rate:string;tax_total:string;grand_total:string;valid_until:string|null;notes:string;payment_terms:string;
 client_name_snapshot:string;client_company_snapshot:string;client_email_snapshot:string;client_phone_snapshot:string;client_city_snapshot:string;client_district_snapshot:string;
 is_archived:boolean;approved_at:string|null;sent_at:string|null;converted_project_id:string|null;created_at:string;updated_at:string;
 items:StudioQuoteItemRow[]|null;converted_project:{id:string;name:string;code:string}|{id:string;name:string;code:string}[]|null};
function date(value:string|null,withTime=false){if(!value)return"";return new Intl.DateTimeFormat("tr-TR",withTime?{day:"numeric",month:"long",year:"numeric",hour:"2-digit",minute:"2-digit",timeZone:"Europe/Istanbul"}:{day:"numeric",month:"long",year:"numeric",timeZone:"UTC"}).format(new Date(value+(value.length===10?"T00:00:00Z":"")));}
export function mapStudioQuote(row:StudioQuoteRow,canManage:boolean):StudioQuote{
 const project=Array.isArray(row.converted_project)?row.converted_project[0]:row.converted_project;
 return{id:row.id,leadId:row.lead_id,quoteNumber:row.quote_number,title:row.title,status:row.status as QuoteStatus,currency:row.currency as QuoteCurrency,
 subtotal:row.subtotal,discountType:row.discount_type as QuoteDiscountType,discountValue:row.discount_value,discountTotal:row.discount_total,taxRate:row.tax_rate,taxTotal:row.tax_total,grandTotal:row.grand_total,
 validUntil:row.valid_until??"",validUntilLabel:date(row.valid_until),notes:row.notes,paymentTerms:row.payment_terms,
 client:{name:row.client_name_snapshot,company:row.client_company_snapshot,email:row.client_email_snapshot,phone:row.client_phone_snapshot,city:row.client_city_snapshot,district:row.client_district_snapshot},
 items:(row.items??[]).sort((a,b)=>a.sort_order-b.sort_order).map(item=>({id:item.id,sortOrder:item.sort_order,serviceName:item.service_name,description:item.description,quantity:item.quantity,unit:item.unit as QuoteUnit,unitPrice:item.unit_price,lineTotal:item.line_total})),
 isArchived:row.is_archived,sentAt:row.sent_at??"",approvedAt:row.approved_at??"",createdAt:row.created_at,updatedAt:row.updated_at,
 createdAtLabel:date(row.created_at,true),updatedAtLabel:date(row.updated_at,true),project:project??null,canManage,
 isPastValidity:Boolean(row.valid_until&&row.status==="Sent"&&row.valid_until<new Date().toISOString().slice(0,10))};
}
export function quoteInputToRpcPayload(input:StudioQuoteInput){return{leadId:input.leadId,title:input.title,currency:input.currency,discountType:input.discountType,
 discountValue:input.discountValue,taxRate:input.taxRate,validUntil:input.validUntil,notes:input.notes,paymentTerms:input.paymentTerms,
 items:input.items.map(item=>({serviceName:item.serviceName,description:item.description,quantity:item.quantity,unit:item.unit,unitPrice:item.unitPrice}))};}
export function quoteToFormValues(quote:StudioQuote){return{leadId:quote.leadId,title:quote.title,currency:quote.currency,discountType:quote.discountType,
 discountValue:quote.discountValue,taxRate:quote.taxRate,validUntil:quote.validUntil,notes:quote.notes,paymentTerms:quote.paymentTerms,
 items:JSON.stringify(quote.items.map(({serviceName,description,quantity,unit,unitPrice})=>({serviceName,description,quantity,unit,unitPrice})))};}
export function summarizeQuotes(rows:Array<{status:string;currency:string;grand_total:string;valid_until:string|null;approved_at:string|null}>,now=new Date()):StudioQuoteSummary{
 const monthStart=new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth(),1));const totals:Record<QuoteCurrency,bigint>={TRY:BigInt(0),USD:BigInt(0),EUR:BigInt(0)};
 const summary:StudioQuoteSummary={draft:0,sent:0,awaitingApproval:0,approved:0,approvedThisMonth:{TRY:"0.00",USD:"0.00",EUR:"0.00"}};
 for(const row of rows){if(row.status==="Draft")summary.draft++;if(row.status==="Sent"){summary.sent++;if(!row.valid_until||row.valid_until>=now.toISOString().slice(0,10))summary.awaitingApproval++;}
  if(row.status==="Approved"||row.status==="Converted"){summary.approved++;if(row.approved_at&&new Date(row.approved_at)>=monthStart&&QUOTE_CURRENCIES.includes(row.currency as QuoteCurrency))totals[row.currency as QuoteCurrency]+=BigInt(Math.round(Number(row.grand_total)*100));}}
 for(const currency of QUOTE_CURRENCIES)summary.approvedThisMonth[currency]=`${totals[currency]/BigInt(100)}.${(totals[currency]%BigInt(100)).toString().padStart(2,"0")}`;
 return summary;
}
export function applyCalculatedTotals(items:StudioQuoteItem[],totals:QuoteTotals){return items.map((item,index)=>({...item,lineTotal:totals.lineTotals[index]}));}
