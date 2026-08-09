export type ReusableCheckoutAttempt={status:string;provider_checkout_url:string|null;provider_token_hash:string|null;expires_at:string|null};

export function isReusableInitializedCheckout(attempt:ReusableCheckoutAttempt,now=Date.now()){
 return attempt.status==="awaiting_payment"&&Boolean(attempt.provider_checkout_url)&&Boolean(attempt.provider_token_hash)&&(!attempt.expires_at||Date.parse(attempt.expires_at)>now);
}
