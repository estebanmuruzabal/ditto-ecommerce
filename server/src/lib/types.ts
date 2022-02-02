import {Collection, ObjectId} from 'mongodb';

export interface Phone {
    id: string
    number: string,
    status?: boolean,
    is_primary?: boolean
}
export interface Address {
    id: string
    title: string,
    address: string,
    division?: string,
    district?: string,
    region?: string,
    is_primary?: boolean
}

export interface IListings {
    _id?: ObjectId;
    title?: string;
    image?: string;
    address?: string;
    price?: number;
    numOfGuests?: number;
    numOfBeds?: number;
    numOfBaths?: number;
    rating?: number;
}

export interface IUser {
    _id?: ObjectId;
    name?: string;
    email?: string;
    password: string;
    phones?: Array<Phone>;
    delivery_address?: Array<Address>;
    otp?: string;
    role?: string;
    created_at: string;
}

export interface IUserAuth {
    user: IUser;
    access_token: string;
}

export interface IType {
    _id?: ObjectId;
    name: string;
    slug?: string;
    image: string;
    icon: string;
    home_title: string;
    home_subtitle: string;
    meta_title?: string;
    meta_keyword?: string;
    meta_description?: string;
    created_at?: string;
    updated_at?: string;
}

export interface ICategoryChildren {
    id: string;
    type_id: string;
    name: string;
    slug: string;
    banner: string;
    icon: string;
}
export interface ICategory {
    _id?: ObjectId;
    type_id: string;
    parent_id?: string | null;
    name: string;
    slug?: string;
    banner?: string;
    icon: string;
    children?: Array<ICategoryChildren>
    meta_title?: string;
    meta_keyword?: string;
    meta_description?: string;
    created_at?: string;
    updated_at?: string;
}
export interface ICoupon {
    _id?: ObjectId;
    title: string;
    code: string;
    percentage: number;
    maximum_discount_amount: number;
    expiration_date?: string;
    created_at?: string;
    updated_at?: string;
    status: string;
    valid?: boolean;
}

export interface ICouponValid {
    valid: boolean
}

export interface IProductCategory {
    id: string;
    name: string;
    slug: string;
}
export interface IProductType {
    id: string;
    name: string;
    slug: string;
}
export interface IProduct {
    _id?: ObjectId;
    type: IProductType;
    categories: Array<IProductCategory>;
    name: string;
    slug?: string;
    description?: string;
    images: Array<string>;
    unit?: string;
    price: number;
    sale_price?: number;
    discount_in_percent?: number;
    product_quantity: number;
    meta_title?: string;
    meta_keyword?: string;
    meta_description?: string;
    is_featured?: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface IDeliveryMethod {
    _id?: ObjectId;
    name: string;
    details: string;
    created_at?: string;
    updated_at?: string;
}

export interface IPaymentOption {
    _id?: ObjectId;
    name: string;
    type: string;
    image: string;
    details?: string;
    created_at?: string;
    updated_at?: string;
}

export interface ICommonPaginationArgs {
    limit: number;
    offset: number;
    searchText?: string;
}

export interface ICommonPaginationReturnType {
    items: Array<any>;
    totalCount: number;
    hasMore: boolean;
}

export interface IOrderTracker {
    status: string;
    ordering: number;
    is_current: boolean;
    step_competed: boolean;
}

export interface OrderProducts {
    product_id: string;
    name?: string;
    image?: string;
    quantity: number;
    unit?: string;
    price: number;
    sale_price?: number;
}

export interface IOrder {
    _id?: ObjectId;
    order_code: string;
    customer_id: string;
    contact_number: string;
    payment_option_id: string;
    datetime: string;
    delivery_method?: string;
    delivery_address: string;
    sub_total: number;
    total: number;
    coupon_code?: string;
    discount_amount?: number;
    payment_id?: string;
    payment_method: string;
    payment_status: string;
    status?: string;
    order_tracking: Array<IOrderTracker>;
    order_products: Array<OrderProducts>;
    created_at?: string;
    updated_at?: string;
}

export interface ICommonMessageReturnType {
    message: string;
    status: boolean;
}

export interface ISetting {
    _id?: ObjectId;
    key: string;
    value: any;
}

export interface IGetCouponReturnType {
    coupon?: ICoupon;
    message?: ICommonMessageReturnType;
}

export interface IHomeCard {
    _id?: ObjectId;
    name: string;
    url?: string;
    types: Array<IProductCategory>;
    image: string;
    status?: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface Database {
    users: Collection<IUser>;
    types: Collection<IType>;
    categories: Collection<ICategory>;
    products: Collection<IProduct>;
    delivery_methods: Collection<IDeliveryMethod>;
    payment_options: Collection<IPaymentOption>;
    orders: Collection<IOrder>;
    settings: Collection<ISetting>;
    coupons: Collection<ICoupon>;
    home_cards: Collection<IHomeCard>;
    listings: Collection<IListings>;
}