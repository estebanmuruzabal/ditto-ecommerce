require("dotenv").config();
import * as bcrypt from "bcrypt";
import shortid from "shortid";

import {ObjectId} from 'mongodb';
import {connectDatabase} from "../src/database";
import {IListings, IType, IUser} from "../src/lib/types";
import { slugify } from "../src/lib/utils/slugify";

const hashPassword = async (password: string) => {
    return await bcrypt.hash(password, 10)
};

const seed = async () => {
    try {
        console.log('[seed]: running...')

        const db = await connectDatabase();
        const listings: IListings[] = [
            {
                _id: new ObjectId(),
                title:
                    "Clean and fully furnished apartment. 5 min away from CN Tower",
                image:
                    "https://res.cloudinary.com/tiny-house/image/upload/v1560641352/mock/Toronto/toronto-listing-1_exv0tf.jpg",
                address: "3210 Scotchmere Dr W, Toronto, ON, CA",
                price: 10000,
                numOfGuests: 2,
                numOfBeds: 1,
                numOfBaths: 2,
                rating: 5
            },
            {
                _id: new ObjectId(),
                title: "Luxurious home with private pool",
                image:
                    "https://res.cloudinary.com/tiny-house/image/upload/v1560645376/mock/Los%20Angeles/los-angeles-listing-1_aikhx7.jpg",
                address:
                    "100 Hollywood Hills Dr, Los Angeles, California",
                price: 15000,
                numOfGuests: 2,
                numOfBeds: 1,
                numOfBaths: 1,
                rating: 4
            },
            {
                _id: new ObjectId(),
                title:
                    "Single bedroom located in the heart of downtown San Fransisco",
                image:
                    "https://res.cloudinary.com/tiny-house/image/upload/v1560646219/mock/San%20Fransisco/san-fransisco-listing-1_qzntl4.jpg",
                address: "200 Sunnyside Rd, San Fransisco, California",
                price: 25000,
                numOfGuests: 3,
                numOfBeds: 2,
                numOfBaths: 2,
                rating: 3
            }
        ];

        const generateOTPCode = () => {
            const digits = '0123456789';
            const otpLength = 6;
            let otp = '';
            for(let i=1; i<=otpLength; i++)
            {
                const index = Math.floor(Math.random()*(digits.length));
                otp = otp + digits[index];
            }
            return otp;
        }

        const otp = generateOTPCode();
        const user: IUser = {
            _id: new ObjectId(),
            name: 'Esteban Muruzabal',
            email: 'estebanmuruzabal@gmail.com',
            password: await hashPassword('123456'),
            phones: [{
                id: new Date().toUTCString(),
                number: '+17863847064',
                status: true,
                is_primary: true
            }],
            delivery_address: [{
                id: 'string',
                title: 'string',
                address: 'string',
                division: 'string',
                district: 'string',
                region: 'string',
                is_primary: true
            }],
            otp: otp,
            role: 'user',
            created_at: new Date().toString(),
        };

        const typeData: IType = {
            _id: new ObjectId(),
            name: 'grocery',
            slug: slugify('grocery'),
            image: '',
            icon: '',
            home_title: '',
            home_subtitle: '',
            meta_title: '',
            meta_keyword: '',
            meta_description: '',
            created_at: new Date().toUTCString(),
        };

        const insertResult = await db.types.insertOne(typeData);

        for (const listing of listings) {
            await db.listings.insertOne(listing);
        }

        await db.users.insertOne(user);

        console.log('[seed]: success')
    } catch {
        throw new Error('Failed to seed mock data.')
    }
};

seed();