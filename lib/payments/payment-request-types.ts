export const PAYMENT_REQUEST_TYPES=["deposit","progress_payment","final_payment","other"] as const;
export const PAYMENT_REQUEST_STATUSES=["pending","paid","cancelled"] as const;
export type PaymentRequestType=typeof PAYMENT_REQUEST_TYPES[number];
export type PaymentRequestStatus=typeof PAYMENT_REQUEST_STATUSES[number];

export type StudioPaymentRequest={
 id:string;title:string;description:string;paymentType:PaymentRequestType;amount:string;currency:string;dueDate:string|null;status:PaymentRequestStatus;paymentProvider:string|null;paidAt:string|null;createdAt:string;
};

export type ClientPaymentRequest=StudioPaymentRequest&{projectId:string;projectName:string};
