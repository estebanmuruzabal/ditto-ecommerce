import {ObjectId} from 'mongodb';
import {IResolvers} from 'apollo-server-express';
import {Request} from "express";
import {
    Database,
    ICommonPaginationArgs,
    ICommonPaginationReturnType,
    ICommonMessageReturnType, IHomeCard
} from "../../../lib/types";
import {authorize} from "../../../lib/utils";
import {search} from "../../../lib/utils/search"
import {storeImage} from "../../../lib/utils/image-store";


export const homeCardsResolvers: IResolvers = {
    Query: {
        homeCards: async (
            _root: undefined,
            {limit, offset, searchText}: ICommonPaginationArgs,
            {db, req}: { db: Database, req: Request }
        ): Promise<ICommonPaginationReturnType> => {
            let data = await db.home_cards.find({}).sort({_id: -1}).toArray();
            data = search(data, ['name', 'url'], searchText);
            const hasMore = data.length > offset + limit;

            return {
                items: limit == 0 ? data : data.slice(offset, offset + limit),
                totalCount: data.length,
                hasMore,
            }
        },
        getHomeCards: async (
            _root: undefined,
            {type}: { type: string},
            {db, req}: { db: Database, req: Request }
        ): Promise<IHomeCard[]> => {
            let data = await db.home_cards.find({status: true}).sort({_id: -1}).toArray();

            if (type) {
                data = data.filter((card) =>
                    card.types.find(
                        (item) => item.slug === type
                    )
                );
            }

            return data;
        }
    },

    Mutation: {
        createHomeCard: async (
            _root: undefined,
            {name, url, image, image_data, status, types}: { name: string, url: string, image: string, image_data: any, status: boolean, types: string },
            {db, req}: { db: Database, req: Request }
        ): Promise<IHomeCard> => {
            await authorize(req, db);
            let imagePath = '';
            imagePath = storeImage(image, image_data.name);

            const data: IHomeCard = {
                _id: new ObjectId(),
                name: name,
                url: url,
                image: imagePath,
                status: status,
                types: JSON.parse(types),
                created_at: new Date().toUTCString(),
            };

            const insertResult = await db.home_cards.insertOne(data);
            return insertResult.ops[0];
        },

        updateHomeCard: async (
            _root: undefined,
            {id, name, url, image, image_data, status, types}: {
                id: string,
                name: string,
                url: string,
                image: string,
                image_data: any,
                status: boolean,
                types: string
            },
            {db, req}: { db: Database, req: Request }
        ): Promise<IHomeCard> => {
            await authorize(req, db);
            let imagePath = '';

            if (image_data) {
                imagePath = storeImage(image, image_data.name);
            } else {
                imagePath = image;
            }

            const data: IHomeCard = {
                name: name,
                url: url,
                image: imagePath,
                status: status,
                types: JSON.parse(types),
                updated_at: new Date().toUTCString(),
            };

            await db.home_cards.updateOne(
                {_id: new ObjectId(id)},
                {$set: data}
            );

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            return await db.home_cards.findOne({_id: new ObjectId(id)});
        },

        deleteHomeCard: async (
            __root: undefined,
            {id}: { id: string },
            {db, req}: { db: Database, req: Request }
        ): Promise<ICommonMessageReturnType> => {
            await authorize(req, db);

            const deleteResult = await db.home_cards.findOneAndDelete({
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

    HomeCard: {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        id: (card: IHomeCard): string => card._id.toString(),
    }
}