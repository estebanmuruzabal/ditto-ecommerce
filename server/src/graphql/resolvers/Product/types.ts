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
export interface IProductInput {
    name: string;
    type: IProductType;
    categories: string;
    description?: string;
    images_data?: any;
    images: [string];
    price: number;
    unit?: string;
    sale_price?: number;
    discount_in_percent?: number;
    product_quantity: number;
    is_featured?: boolean;
    meta_title?: string;
    meta_keyword?: string;
    meta_description?: string;
}
export interface IUpdateProductInput {
    name: string;
    type: IProductType;
    categories: string;
    description?: string;
    images_data?: any;
    images: [string];
    price: number;
    unit?: string;
    sale_price?: number;
    discount_in_percent?: number;
    product_quantity: number;
    is_featured?: boolean;
    meta_title?: string;
    meta_keyword?: string;
    meta_description?: string;
}

export interface IUpdateProductInputArgs {
    id?: string;
    input: IUpdateProductInput;
}

export interface IProductsArgs {
    type?: string;
    category?: string;
    limit: number;
    offset: number;
    searchText?: string;
}
