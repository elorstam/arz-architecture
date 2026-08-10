const windows=new Map<string,{count:number;reset:number}>();
export function checkPublicPaymentRateLimit(key:string,limit=12,windowMs=60_000){const now=Date.now(),current=windows.get(key);if(!current||current.reset<=now){windows.set(key,{count:1,reset:now+windowMs});return true;}if(current.count>=limit)return false;current.count+=1;return true;}
