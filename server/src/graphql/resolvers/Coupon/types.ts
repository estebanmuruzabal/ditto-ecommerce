export interface ICouponInput {
    title: string;
    code: string;
    percentage: number
    maximum_discount_amount: number
    expiration_date: string;
    status: string;
}

export interface ICouponInputArgs {
    id?: string;
    input: ICouponInput;
}