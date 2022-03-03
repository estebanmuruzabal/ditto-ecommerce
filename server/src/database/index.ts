import {MongoClient} from "mongodb";
import {Database} from "../lib/types";
// env settings
require("dotenv").config();

let url: string;
const dbName = "dittodb";
const dbUserName = process.env.DB_USER;
// @ts-ignore
const dbPassword: string = process.env.DB_USER_PASSWORD;

    console.log(process.env.APP_ENV)
if (process.env.APP_ENV == 'production') {
    url = `mongodb+srv://${dbUserName}:${dbPassword}@${process.env.DB_CLUSTER}.mongodb.net/dittodb`;
} else if (process.env.APP_ENV == 'server') {
    url = `mongodb://${dbUserName}:${encodeURIComponent(dbPassword)}@${process.env.DB_CLUSTER}:27017/?authMechanism=DEFAULT&authSource=admin&ssl=false`;
} else if (process.env.APP_ENV == 'local') {
    url = <string>process.env.DB_URL;
}


export const connectDatabase = async (): Promise<Database> => {
    console.log("[mongodb]: Starting db init...")
    console.log(url)
    const client = await MongoClient.connect(url, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    console.log("[mongodb]: Connected successfully to database");

    const db = client.db(dbName);
    const allCollections = {
        users: db.collection('users'),
        types: db.collection('types'),
        categories: db.collection('categories'),
        products: db.collection('products'),
        delivery_methods: db.collection('delivery_methods'),
        listings: db.collection('listings'),
        payment_options: db.collection('payment_options'),
        orders: db.collection('orders'),
        settings: db.collection('settings'),
        coupons: db.collection('coupons'),
        home_cards: db.collection('home_cards'),
    };

    console.log('allCollections:', client.db(dbName))
    return allCollections;
};