export interface IOrderProductInput {
    product_id: string;
    name?: string;
    image?: string;
    quantity: number;
    unit?: string;
    price: number;
}
interface IOrderInput {
    customer_id: string;
    contact_number: string;
    payment_option_id: string;
    delivery_method_id: string;
    delivery_address: string;
    sub_total: number;
    total: number;
    coupon_code?: string;
    discount_amount?: number;
    products: Array<IOrderProductInput>;
    payment_id?:  string;
}

export interface IOrderInputArgs {
    id?: string;
    input: IOrderInput;
}