import {ObjectId} from 'mongodb';
import {IResolvers} from 'apollo-server-express';
import {Request} from "express";
import {
    Database,
    ICommonMessageReturnType,
    ICommonPaginationArgs,
    ICommonPaginationReturnType,
    IDeliveryMethod
} from "../../../lib/types";
import {authorize} from "../../../lib/utils";
import {search} from "../../../lib/utils/search";

export const deliveryMethodsResolvers: IResolvers = {
    Query: {
        deliveryMethods: async (
            _root: undefined,
            {limit, offset, searchText}: ICommonPaginationArgs,
            {db, req}: { db: Database, req: Request }
        ): Promise<ICommonPaginationReturnType> => {
            let data = await db.delivery_methods.find({}).sort({_id: -1}).toArray();
            data = search(data, ['name', 'details'], searchText);
            const hasMore = data.length > offset + limit;

            return {
                items: limit == 0 ? data : data.slice(offset, offset + limit),
                totalCount: data.length,
                hasMore,
            }
        }
    },

    Mutation: {
        createDeliveryMethod: async (
            _root: undefined,
            {name, details}: { name: string, details: string },
            {db, req}: { db: Database, req: Request }
        ): Promise<IDeliveryMethod> => {
            await authorize(req, db);

            const existsData = await db.delivery_methods.findOne({name: name});

            if (existsData) {
                throw new Error("Resource already exits.");
            }

            const insertData: IDeliveryMethod = {
                _id: new ObjectId(),
                name: name,
                details: details,
                created_at: new Date().toUTCString(),
            };

            const insertResult = await db.delivery_methods.insertOne(insertData);
            return insertResult.ops[0];
        },

        updateDeliveryMethod: async (
            _root: undefined,
            {id, name, details}: { id: string, name: string, details: string },
            {db, req}: { db: Database, req: Request }
        ): Promise<IDeliveryMethod> => {
            await authorize(req, db);

            const existsData = await db.delivery_methods.findOne({_id: new ObjectId(id)});
            if (!existsData) {
                throw new Error("Resource not found.");
            }

            const updateData: IDeliveryMethod = {
                name: name,
                details: details,
                updated_at: new Date().toUTCString(),
            };

            await db.delivery_methods.updateOne(
                {_id: new ObjectId(id)},
                {$set: updateData}
            );

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            return await db.delivery_methods.findOne({_id: new ObjectId(id)});
        },

        deleteDeliveryMethod: async (
            __root: undefined,
            {id}: { id: string },
            {db, req}: { db: Database, req: Request }
        ): Promise<ICommonMessageReturnType> => {
            await authorize(req, db);

            const deleteResult = await db.delivery_methods.findOneAndDelete({
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

    DeliveryMethod: {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        id: (type: IDeliveryMethod): string => type._id.toString(),
    }
}