import type {QuoteDiscountType,QuoteTotals,StudioQuoteInput} from "./quote-types.ts";

function parseScaled(value:string,scale:number){
 const normalized=value.trim().replace(",",".");if(!/^\d+(?:\.\d+)?$/.test(normalized))throw new Error("invalid_decimal");
 const[whole,fraction=""]=normalized.split(".");const factor=BigInt(10)**BigInt(scale);
 const padded=(fraction+"0".repeat(scale+1)).slice(0,scale+1);let result=BigInt(whole)*factor+BigInt(padded.slice(0,scale)||"0");
 if(Number(padded[scale]??"0")>=5)result+=BigInt(1);return result;
}
function money(value:bigint){return `${value/BigInt(100)}.${(value%BigInt(100)).toString().padStart(2,"0")}`;}
function percent(value:string){return parseScaled(value,2);}
export function calculateQuoteTotals(input:Pick<StudioQuoteInput,"items"|"discountType"|"discountValue"|"taxRate">):QuoteTotals{
 const lineCents=input.items.map(item=>{const quantity=parseScaled(item.quantity,3);const unitPrice=parseScaled(item.unitPrice,2);return(quantity*unitPrice+BigInt(500))/BigInt(1000);});
 const subtotal=lineCents.reduce((sum,value)=>sum+value,BigInt(0));const discountValue=parseScaled(input.discountValue||"0",2);
 let discount=BigInt(0);
 if(input.discountType==="Percentage")discount=(subtotal*percent(input.discountValue||"0")+BigInt(5000))/BigInt(10000);
 if(input.discountType==="Fixed")discount=discountValue;
 if(discount>subtotal)throw new Error("discount_exceeds_subtotal");
 const discounted=subtotal-discount;const tax=(discounted*percent(input.taxRate||"0")+BigInt(5000))/BigInt(10000);
 return{subtotal:money(subtotal),discountTotal:money(discount),taxTotal:money(tax),grandTotal:money(discounted+tax),lineTotals:lineCents.map(money)};
}
export function isDiscountType(value:string):value is QuoteDiscountType{return value==="None"||value==="Fixed"||value==="Percentage";}
