export interface ICategoryInput {
    type_id: string;
    parent_id?: string;
    name: string;
    banner?: any;
    banner_data?: any;
    icon: string;
    meta_title?: string;
    meta_keyword?: string;
    meta_description?: string;
}

export interface ICategoryInputArgs {
    id?: string;
    input: ICategoryInput;
}