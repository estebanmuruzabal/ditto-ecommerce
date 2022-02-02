import {ObjectId} from 'mongodb';
import {IResolvers} from 'apollo-server-express';
import {Request} from "express";
import {
    Database,
    ICoupon,
    ICommonMessageReturnType,
    ICommonPaginationArgs,
    ICommonPaginationReturnType, IProduct, ICouponValid, IGetCouponReturnType
} from "../../../lib/types";
import {authorize} from "../../../lib/utils";
import {ICouponInputArgs} from "./types";
import {search} from "../../../lib/utils/search";
import {RUNNING} from "../../../lib/utils/constant";

const checkCouponDateNotExpired = function (coupon: ICoupon): boolean {

    const expireDate = new Date(coupon.expiration_date ? coupon.expiration_date : new Date);
    const today = new Date();
    return (expireDate > today);
};
const checkCouponRunningStatus = function (coupon: ICoupon): boolean {

    return (coupon.status == RUNNING);
};

const checkCouponValidity = function (coupon: ICoupon): boolean {

    if(!checkCouponDateNotExpired(coupon))  throw new Error("Sorry ! This Coupon is Expired.");

    if(!checkCouponRunningStatus)   throw new Error("Sorry ! This Coupon is Disabled.");

    return true;
};

export const couponsResolvers: IResolvers = {
    Query: {
        coupons: async (
            _root: undefined,
            {limit, offset, searchText}: {
                limit: ICommonPaginationArgs["limit"],
                offset: ICommonPaginationArgs["offset"],
                searchText: ICommonPaginationArgs["searchText"]
            },
            {db, req}: { db: Database, req: Request }
        ): Promise<ICommonPaginationReturnType> => {
            let coupons = await db.coupons.find({}).sort({_id: -1}).toArray();

            coupons = coupons.map( coupon => ({ ...coupon, valid: (checkCouponDateNotExpired(coupon) && checkCouponRunningStatus(coupon))}))

            coupons = search(coupons, ['title', 'code'], searchText);
            const hasMore = coupons.length > offset + limit;
            return {
                items: limit == 0 ? coupons : coupons.slice(offset, offset + limit),
                totalCount: coupons.length,
                hasMore,
            }
        },

        validateCoupon: async (
            _root: undefined,
            {code}: { code: string },
            {db, req}: { db: Database, req: Request }
        ): Promise<ICouponValid> => {
            try{
                const coupon = await db.coupons.findOne({code: code});
                if (!coupon) throw new Error("Resource not found.");

                const validity = checkCouponValidity(coupon);

                return { valid: validity };

            } catch (error) {
                console.log(error.message)
                throw error
            }
        },
    },

    Mutation: {
        createCoupon: async (
            _root: undefined,
            {input}: ICouponInputArgs,
            {db, req}: { db: Database, req: Request }
        ): Promise<ICoupon> => {

            await authorize(req, db);

            const existsData = await db.coupons.findOne({code: input.code});
            if (existsData) {
                throw new Error("This Code already exits.");
            }

            const insertData: ICoupon = {
                _id: new ObjectId(),
                title: input.title,
                code: input.code,
                percentage: input.percentage,
                maximum_discount_amount: input.maximum_discount_amount,
                expiration_date: input.expiration_date,
                status: input.status ? input.status : RUNNING,
                created_at: new Date().toUTCString(),
                updated_at: '',
            };

            const insertResult = await db.coupons.insertOne(insertData);
            return insertResult.ops[0];
        },

        updateCoupon: async (
            _root: undefined,
            {id, input}: ICouponInputArgs,
            {db, req}: { db: Database, req: Request }
        ): Promise<ICoupon> => {
            // await authorize(req, db);
            const couponExists = await db.coupons.findOne({_id: new ObjectId(id)});
            if (!couponExists) {
                throw new Error("Resource not found.");
            }

            const updateData: ICoupon = {
                title: input.title,
                code: input.code,
                percentage: input.percentage,
                maximum_discount_amount: input.maximum_discount_amount,
                expiration_date: input.expiration_date,
                status: input.status,
                updated_at: new Date().toUTCString(),
            };

            await db.coupons.updateOne(
                {_id: new ObjectId(id)},
                {$set: updateData}
            );

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            return await db.coupons.findOne({_id: new ObjectId(id)});
        },

        deleteCoupon: async (
            __root: undefined,
            {id}: { id: string },
            {db, req}: { db: Database, req: Request }
        ): Promise<ICommonMessageReturnType> => {
            await authorize(req, db);

            const deleteResult = await db.coupons.findOneAndDelete({
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

        getCoupon: async (
            _root: undefined,
            {code}: { code: string },
            {db, req}: { db: Database, req: Request }
        ): Promise<IGetCouponReturnType> => {
            let coupon = await db.coupons.findOne({code: code});
            let message;

            if (!coupon) {
                message = {
                    status: false,
                    message: "Coupon invalid."
                }
            }

            if(coupon && !checkCouponDateNotExpired(coupon)) {
                message = {
                    status: false,
                    message: "Coupon invalid."
                }
            }

            if(coupon && coupon.status !== RUNNING) {
                message = {
                    status: false,
                    message: "Coupon invalid."
                }
            }

            if (message && !message.status) {
                coupon = null;
            }

            return {
                coupon: coupon ? coupon : undefined,
                message: message ? message : undefined,
            }
        },
    },

    Coupon: {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        id: (coupon: ICoupon): string => coupon._id.toString(),

    }
};