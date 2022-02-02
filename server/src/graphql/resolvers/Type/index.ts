import {ObjectId} from 'mongodb';
import {IResolvers} from 'apollo-server-express';
import {Request} from "express";
import {
    Database,
    ICommonPaginationArgs,
    ICommonPaginationReturnType,
    IType,
    ICommonMessageReturnType
} from "../../../lib/types";
import {authorize} from "../../../lib/utils";
import {ITypeInputArgs} from "./types";
import {slugify} from "../../../lib/utils/slugify";
import {search} from "../../../lib/utils/search"
import {storeImage} from "../../../lib/utils/image-store";


export const typesResolvers: IResolvers = {
    Query: {
        types: async (
            _root: undefined,
            {limit, offset, searchText}: ICommonPaginationArgs,
            {db, req}: { db: Database, req: Request }
        ): Promise<ICommonPaginationReturnType> => {
            let types = await db.types.find({}).sort({_id: -1}).toArray();
            types = search(types, ['name', 'slug'], searchText);
            const hasMore = types.length > offset + limit;

            return {
                items: limit == 0 ? types : types.slice(offset, offset + limit),
                totalCount: types.length,
                hasMore,
            }
        }
    },

    Mutation: {
        createType: async (
            _root: undefined,
            {input}: ITypeInputArgs,
            {db, req}: { db: Database, req: Request }
        ): Promise<IType> => {
            await authorize(req, db);
            let imagePath = '';
            const typeResult = await db.types.findOne({slug: slugify(input.name)});

            if (typeResult) {
                throw new Error("Type already exits.");
            }

            if (input.image_data) {
                imagePath = storeImage(input.image, input.image_data.name);
            } else {
                imagePath = 'images/grocery-default-image.png';
            }

            const typeData: IType = {
                _id: new ObjectId(),
                name: input.name,
                slug: slugify(input.name),
                image: imagePath,
                icon: input.icon,
                home_title: input.home_title,
                home_subtitle: input.home_subtitle,
                meta_title: input.meta_title,
                meta_keyword: input.meta_keyword,
                meta_description: input.meta_description,
                created_at: new Date().toUTCString(),
            };

            const insertResult = await db.types.insertOne(typeData);
            return insertResult.ops[0];
        },

        updateType: async (
            _root: undefined,
            {id, input}: ITypeInputArgs,
            {db, req}: { db: Database, req: Request }
        ): Promise<IType> => {
            await authorize(req, db);
            let imagePath = '';

            if (input.image_data) {
                imagePath = storeImage(input.image, input.image_data.name);
            } else {
                imagePath = input.image;
            }

            const typeData: IType = {
                name: input.name,
                slug: slugify(input.name),
                image: imagePath,
                icon: input.icon,
                home_title: input.home_title,
                home_subtitle: input.home_subtitle,
                meta_title: input.meta_title,
                meta_keyword: input.meta_keyword,
                meta_description: input.meta_description,
                updated_at: new Date().toUTCString(),
            };

            await db.types.updateOne(
                {_id: new ObjectId(id)},
                {$set: typeData}
            );

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            return await db.types.findOne({_id: new ObjectId(id)});
        },

        deleteType: async (
            __root: undefined,
            {id}: { id: string },
            {db, req}: { db: Database, req: Request }
        ): Promise<ICommonMessageReturnType> => {
            await authorize(req, db);

            const deleteResult = await db.types.findOneAndDelete({
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

    MainType: {
        // @ts-ignore
        id: (type: IType): string => type._id.toString(),
    }
}