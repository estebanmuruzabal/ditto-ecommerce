import {ObjectId} from 'mongodb';
import {IResolvers} from 'apollo-server-express';
import {Request} from "express";
import {
    Database,
    ICommonMessageReturnType,
    ICommonPaginationArgs,
    ICommonPaginationReturnType,
    IPaymentOption
} from "../../../lib/types";
import {authorize} from "../../../lib/utils";
import {search} from "../../../lib/utils/search";
import {storeImage} from "../../../lib/utils/image-store";

export const paymentOptionsResolvers: IResolvers = {
    Query: {
        paymentOptions: async (
            _root: undefined,
            {limit, offset, searchText}: ICommonPaginationArgs,
            {db, req}: { db: Database, req: Request }
        ): Promise<ICommonPaginationReturnType> => {
            let data = await db.payment_options.find({}).sort({_id: -1}).toArray();
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
        createPaymentOption: async (
            _root: undefined,
            {name, type, image, image_data, details}: { name: string, type: string, image: string, image_data: any, details: string },
            {db, req}: { db: Database, req: Request }
        ): Promise<IPaymentOption> => {
            await authorize(req, db);
            image_data = JSON.parse(image_data);
            let imagePath = '';
            const existsData = await db.payment_options.findOne({name: name});

            if (existsData) {
                throw new Error("Resource already exits.");
            }

            if (image_data) {
                imagePath = storeImage(image, image_data.name);
            }


            const insertData: IPaymentOption = {
                _id: new ObjectId(),
                name: name,
                type: type,
                image: imagePath,
                details: details,
                created_at: new Date().toUTCString(),
            };

            const insertResult = await db.payment_options.insertOne(insertData);
            return insertResult.ops[0];
        },

        updatePaymentOption: async (
            _root: undefined,
            {id, name, type, image, image_data, details}: { id: string, name: string, type: string, image: string, image_data: any, details: string },
            {db, req}: { db: Database, req: Request }
        ): Promise<IPaymentOption> => {
            await authorize(req, db);

            const existsData = await db.payment_options.findOne({_id: new ObjectId(id)});
            if (!existsData) {
                throw new Error("Resource not found.");
            }

            image_data = JSON.parse(image_data);
            let imagePath = '';

            if (image_data) {
                imagePath = storeImage(image, image_data.name);
            } else {
                imagePath = image;
            }

            const updateData: IPaymentOption = {
                name: name,
                type: type,
                image: imagePath,
                details: details ? details : existsData.details,
                updated_at: new Date().toUTCString(),
            };

            await db.payment_options.updateOne(
                {_id: new ObjectId(id)},
                {$set: updateData}
            );

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            return await db.payment_options.findOne({_id: new ObjectId(id)});
        },

        deletePaymentOption: async (
            __root: undefined,
            {id}: { id: string },
            {db, req}: { db: Database, req: Request }
        ): Promise<ICommonMessageReturnType> => {
            await authorize(req, db);

            const deleteResult = await db.payment_options.findOneAndDelete({
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

    PaymentOption: {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        id: (type: IPaymentOption): string => type._id.toString(),
    }
}