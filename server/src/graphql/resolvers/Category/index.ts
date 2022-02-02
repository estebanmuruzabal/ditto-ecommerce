import {ObjectId} from 'mongodb';
import {IResolvers} from 'apollo-server-express';
import {Request} from "express";
import {
    Database,
    ICategory,
    ICommonMessageReturnType,
    ICommonPaginationArgs,
    ICommonPaginationReturnType
} from "../../../lib/types";
import {authorize} from "../../../lib/utils";
import {ICategoryInputArgs} from "./types";
import {slugify} from "../../../lib/utils/slugify";
import {search} from "../../../lib/utils/search";
import {storeImage} from "../../../lib/utils/image-store";

export const categoriesResolvers: IResolvers = {
    Query: {
        categories: async (
            _root: undefined,
            { type, limit, offset, searchText }: {
                type: string,
                limit: ICommonPaginationArgs["limit"],
                offset: ICommonPaginationArgs["offset"],
                searchText: ICommonPaginationArgs["searchText"]
            },
            {db, req}: { db: Database, req: Request }
        ): Promise<ICommonPaginationReturnType> => {
            let categories =  await db.categories.find({}).sort({_id: -1}).toArray();

            if (type) {
                categories = categories.filter((category) => {
                    return category.type_id === type;
                });
            }


            categories = search(categories, ['name', 'slug'], searchText);
            const hasMore = categories.length > offset + limit;
            return {
                items: limit == 0 ? categories : categories.slice(offset, offset + limit),
                totalCount: categories.length,
                hasMore,
            }
        },
        shopCategories: async (
            _root: undefined,
            {type, limit, offset, searchText }: {
                type: string,
                limit: ICommonPaginationArgs["limit"],
                offset: ICommonPaginationArgs["offset"],
                searchText: ICommonPaginationArgs["searchText"]
            },
            {db, req}: { db: Database, req: Request }
        ): Promise<ICommonPaginationReturnType> => {
            let categories =  await db.categories.find({parent_id: null}).sort({_id: -1}).toArray();

            if (type) {
                const typeResult = await db.types.findOne({slug: type});
                categories = categories.filter((category) => {
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    return category.type_id === typeResult._id.toString();
                });
            }

            categories = search(categories, ['name', 'slug'], searchText);
            const hasMore = categories.length > offset + limit;
            return {
                items: limit == 0 ? categories : categories.slice(offset, offset + limit),
                totalCount: categories.length,
                hasMore,
            }
        }
    },

    Mutation: {
        createCategory: async (
            _root: undefined,
            {input}: ICategoryInputArgs,
            {db, req}: { db: Database, req: Request }
        ): Promise<ICategory> => {
            await authorize(req, db);
            let bannerImagePath = '';
            const existsData = await db.categories.findOne({slug: slugify(input.name)});

            if (existsData) {
                throw new Error("Resource already exits.");
            }

            if (input.banner_data) {
                bannerImagePath = storeImage(input.banner, input.banner_data.name);
            } else {
                bannerImagePath = 'images/grocery-default-image.png';
            }

            const insertData: ICategory = {
                _id: new ObjectId(),
                type_id: input.type_id,
                parent_id: input.parent_id ? input.parent_id : null,
                name: input.name,
                slug: slugify(input.name),
                banner: bannerImagePath,
                icon: input.icon,
                meta_title: input.meta_title,
                meta_keyword: input.meta_keyword,
                meta_description: input.meta_description,
                created_at: new Date().toUTCString(),
            };

            const insertResult = await db.categories.insertOne(insertData);
            return insertResult.ops[0];
        },

        updateCategory: async (
            _root: undefined,
            {id, input}: ICategoryInputArgs,
            {db, req}: { db: Database, req: Request }
        ): Promise<ICategory> => {
            await authorize(req, db);
            let bannerImagePath = '';
            const existsData = await db.categories.findOne({_id: new ObjectId(id)});
            if (!existsData) {
                throw new Error("Resource not found.");
            }

            if (input.banner_data) {
                bannerImagePath = storeImage(input.banner, input.banner_data.name);
            } else {
                bannerImagePath = input.banner;
            }

            const updateData: ICategory = {
                type_id: input.type_id,
                parent_id: input.parent_id ? input.parent_id : null,
                name: input.name,
                slug: slugify(input.name),
                banner: bannerImagePath,
                icon: input.icon,
                meta_title: input.meta_title,
                meta_keyword: input.meta_keyword,
                meta_description: input.meta_description,
                updated_at: new Date().toUTCString(),
            };

            await db.categories.updateOne(
                {_id: new ObjectId(id)},
                {$set: updateData}
            );

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            return await db.categories.findOne({_id: new ObjectId(id)});
        },

        deleteCategory: async (
            __root: undefined,
            {id}: { id: string },
            {db, req}: { db: Database, req: Request }
        ): Promise<ICommonMessageReturnType> => {
            await authorize(req, db);

            const deleteResult = await db.categories.findOneAndDelete({
                _id: new ObjectId(id)
            });

            if (!deleteResult.value) {
                throw new Error("Failed to delete resource.")
            }

            return {
                message: 'Resource successfully deleted.',
                status: true
            };
        },
    },

    Category: {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        id: (category: ICategory): string => category._id.toString(),
        // eslint-disable-next-line @typescript-eslint/ban-types
        children: async (category: ICategory, _args: {}, { db }: { db: Database }) => {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore

            const categories =  await db.categories.find({parent_id: category._id.toString()}).sort({_id: -1}).toArray();
            const convertedCategories = [];

            for (let i = 0; i < categories.length; i++) {
                const categoryItem = categories[i];
                convertedCategories.push({
                    id: categoryItem._id ? categoryItem._id.toString() : null,
                    type_id: categoryItem.type_id,
                    name: categoryItem.name,
                    slug: categoryItem.slug,
                    banner: categoryItem.banner,
                    icon: categoryItem.icon
                })
            }

            return convertedCategories;
        },
    }
}