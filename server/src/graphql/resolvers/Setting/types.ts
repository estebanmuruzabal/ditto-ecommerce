export interface ITypeInput {
    name: string;
    image_data?: any;
    image?: any;
    icon: string;
    meta_title?: string;
    meta_keyword?: string;
    meta_description?: string;
}

export interface ITypeInputArgs {
    id?: string;
    input: ITypeInput;
}