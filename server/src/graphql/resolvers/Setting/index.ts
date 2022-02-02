import {ObjectId} from 'mongodb';
import {IResolvers} from 'apollo-server-express';
import {Request} from "express";
import {Database, ISetting} from "../../../lib/types";
import {authorize} from "../../../lib/utils";
import {storeImage} from "../../../lib/utils/image-store";


export const settingsResolvers: IResolvers = {
    Query: {
        getSetting: async (
            _root: undefined,
            {key}: {key: string},
            {db, req}: { db: Database, req: Request }
        ): Promise<ISetting> => {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            return await db.settings.findOne({key: key});
        },

        getSiteSetting: async (
            _root: undefined,
            {key}: {key: string},
            {db, req}: { db: Database, req: Request }
        ): Promise<ISetting> => {
            const siteSetting = await db.settings.findOne({key: key});

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const {_id, key: key1, value} = siteSetting;
            return {
                _id: _id.toString(),
                key: key1,
                value: JSON.stringify(value)
            };
        }
    },

    Mutation: {
        updateSiteSetting: async (
            _root: undefined,
            {key, value}: {key: string, value: string},
            {db, req}: { db: Database, req: Request }
        ): Promise<ISetting> => {
            await authorize(req, db);

            const siteSetting = await db.settings.findOne({key: key});
            const settingValues = JSON.parse(value);

            if (!siteSetting) {
                let imagePath: string | null = '';
                let faviconPath: string | null = '';

                if (settingValues.image_data) {
                    imagePath = storeImage(settingValues.image, settingValues.image_data.name);
                } else {
                    imagePath = null;
                }

                if (settingValues.favicon_data) {
                    faviconPath = storeImage(settingValues.favicon, settingValues.favicon_data.name);
                } else {
                    faviconPath = null;
                }

                const settingData = {
                    _id: new ObjectId(),
                    key: key,
                    value: {
                        image: imagePath,
                        favicon: faviconPath,
                        site_title: settingValues.site_title,
                        site_keyword: settingValues.site_keyword,
                        site_description: settingValues.site_description,
                    }
                };
                const insertResult = await db.settings.insertOne(settingData);
                return {
                    _id: insertResult.ops[0]._id,
                    key: insertResult.ops[0].key,
                    value: JSON.stringify(insertResult.ops[0].value)
                };
            }




            let imagePath = '';
            if (settingValues.image_data) {
                imagePath = storeImage(settingValues.image, settingValues.image_data.name);
            } else {
                imagePath = settingValues.image;
            }

            let faviconPath = '';
            if (settingValues.favicon_data) {
                faviconPath = storeImage(settingValues.favicon, settingValues.favicon_data.name);
            } else {
                faviconPath = settingValues.favicon;
            }

            const settingData = {
                key: key,
                value: {
                    image: imagePath,
                    favicon: faviconPath,
                    site_title: settingValues.site_title,
                    site_keyword: settingValues.site_keyword,
                    site_description: settingValues.site_description,
                }
            };

            await db.settings.updateOne(
                {_id: siteSetting._id},
                {$set: settingData}
            );

            const updatedSiteSetting = await db.settings.findOne({_id: siteSetting._id});

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const {_id, key: key1, value: updatedValue} = updatedSiteSetting;
            return {
                _id: _id,
                key: key1,
                value: JSON.stringify(updatedValue)
            };
        },
    },

    MainType: {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        id: (setting: ISetting): string => setting._id.toString(),
    }
}