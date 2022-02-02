import {ObjectId} from 'mongodb';
import {IResolvers} from 'apollo-server-express';
import {Request} from "express";
import {Address, Database, ICommonMessageReturnType, IUser, IUserAuth, Phone} from "../../../lib/types";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import {authorize} from "../../../lib/utils";
import shortid from "shortid";
import {sendOtp} from "../../../lib/utils/number-verification-otp";

const hashPassword = async (password: string) => {
    return await bcrypt.hash(password, 10)
};

const validatePassword = async (plainPassword: string, hashPassword: string) => {
    return await bcrypt.compare(plainPassword, hashPassword);
};

const accessToken = (id: any) => {
    const secret = <string>process.env.JWT_SECRET;
    return jwt.sign({UserId: id}, secret, {expiresIn: "1d"})
};

const authChecker = (token: string, secret: string) => {
    if (!token) {
        return false;
    }

    try {
        jwt.verify(token, secret);
    } catch(err) {
        return false;
    }

    const {UserId, exp} = <any>jwt.verify(token, secret);

    if (exp < Date.now().valueOf() / 1000) {
        return false;
    }

    return true;
}

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

export const usersResolvers: IResolvers = {
    Query: {
        users: async (
            _root: undefined,
            _args: undefined,
            {db, req}: { db: Database, req: Request }
        ): Promise<IUser[]> => {
            await authorize(req, db);
            return await db.users.find({}).toArray();
        },
        getUser: async (
            _root: undefined,
            {id}: { id: string },
            {db, req}: { db: Database, req: Request }
        ): Promise<IUser> => {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            return await authorize(req, db);
        },
        userAuthCheck: async (
            _root: undefined,
            _args: undefined,
            {db, req}: { db: Database, req: Request }
        ): Promise<ICommonMessageReturnType> => {
            const token = <string>req.headers["x-access-token"];
            const secret = <string>process.env.JWT_SECRET;

            if (authChecker(token, secret)) {
                return {
                    status: true,
                    message: "Authenticate user is valid."
                };
            }

            return {
                status: false,
                message: "User dose not valid."
            }
        },
    },

    Mutation: {
        signUp: async (
            _root: undefined,
            {phone, password}: { phone: string, password: string },
            {db}: { db: Database }
        ): Promise<ICommonMessageReturnType> => {
            const userResult = await db.users.findOne({"phones.number": phone});

            if (userResult) {
                throw new Error("User already registered.");
            }

            if (!phone ||!password || password.length < 6) {
                throw new Error("Every field is required");
            }

            const otp = generateOTPCode();
            const user: IUser = {
                _id: new ObjectId(),
                name: "",
                email: "",
                password: await hashPassword(password),
                phones: [{id: shortid.generate(), number: phone, status: false, is_primary: true}],
                otp: otp,
                role: 'user',
                created_at: new Date().toString(),
            };

            await db.users.insertOne(user);

            const {data, status} = await sendOtp(phone, otp);
            if (status != 201) {
                throw new Error("Something went wrong! Please try again.");
            }

            return {
                status: true,
                message: "Successfully send otp to your number."
            };
        },
        login: async (
            _root: undefined,
            {phone, password}: { phone: string, password: string },
            {db}: { db: Database }
        ): Promise<IUserAuth> => {
            const userResult = await db.users.findOne({"phones.number": phone});
            if (!userResult) {
                throw new Error("User dose not exits.");
            }

            const validatePass = await validatePassword(password, userResult.password);
            if (!validatePass) {
                throw new Error("Password dose not match.")
            }

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const phoneObject = userResult.phones.filter(userPhone => {
                if (userPhone.number == phone) {
                    return userPhone
                }
            });
            if (!phoneObject[0].status) {
                throw new Error("Phone number dose not verified. Please verify your phone number.")
            }

            return {
                user: userResult,
                access_token: accessToken(userResult._id),
            }
        },
        phoneVerification: async (
            _root: undefined,
            {phone}: { phone: string },
            {db}: { db: Database }
        ): Promise<ICommonMessageReturnType> => {
            const userResult = await db.users.findOne({"phones.number": phone});
            if (!userResult) {
                throw new Error("User dose not exits.");
            }

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const phoneObject = userResult.phones.filter(userPhone => {
                if (userPhone.number == phone) {
                    return userPhone
                }
            });

            const otp = generateOTPCode();
            await db.users.updateOne(
                {_id: userResult._id, "phones.id": phoneObject[0].id},
                {$set: {otp: otp}}
            );

            const {data, status} = await sendOtp(phone, otp);
            if (status != 201) {
                throw new Error("Something went wrong! Please try again.");
            }

            return {
                status: true,
                message: "Successfully send otp to your number."
            };
        },
        phoneVerificationCheck: async (
            _root: undefined,
            {phone, verification_code}: { phone: string, verification_code: string },
            {db}: { db: Database }
        ): Promise<IUserAuth> => {
            const userResult = await db.users.findOne({"phones.number": phone});
            if (!userResult) {
                throw new Error("User dose not exits.");
            }

            if (userResult.otp != verification_code) {
                throw new Error("Verification code dose not match.");
            }

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const phoneObject = userResult.phones.filter(userPhone => {
                if (userPhone.number == phone) {
                    return userPhone
                }
            });

            await db.users.updateOne(
                {_id: userResult._id, "phones.id": phoneObject[0].id},
                {$set: {"phones.$.status": true, otp: ""}}
            );

            return {
                user: userResult,
                access_token: accessToken(userResult._id),
            }
        },
        updateUserNameAndEmail: async (
            _root: undefined,
            {id, name, email}: { id: string, name: string, email: string },
            {db, req}: { db: Database, req: Request }
        ): Promise<ICommonMessageReturnType> => {
            await authorize(req, db);

            const userResult = await db.users.findOne({_id: new ObjectId(id)});
            if (!userResult) {
                throw new Error("User dose not exits.");
            }

            await db.users.updateOne(
                {_id: new ObjectId(id)},
                {$set: {name: name, email: email}}
            );

            return {
                status: true,
                message: "Updated successfully."
            };
        },
        addPhoneNumber: async (
            _root: undefined,
            {id, number}: { id: string, number: string },
            {db, req}: { db: Database, req: Request }
        ): Promise<Phone> => {
            await authorize(req, db);

            const userResult = await db.users.findOne({_id: new ObjectId(id)});
            if (!userResult) {
                throw new Error("User dose not exits.");
            }

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            if (userResult.phones.length == 2) {
                throw new Error("Already added two phone numbers. You are not allowed to add more than two numbers.");
            }

            const phoneObject = {
                id: shortid.generate(),
                number: number,
                status: false,
                is_primary: false
            };

            await db.users.updateOne(
                {_id: new ObjectId(id)},
                {$push: {phones: phoneObject}}
            );

            return phoneObject;
        },
        updatePhoneNumber: async (
            _root: undefined,
            {id, phoneId, number}: { id: string, phoneId: string, number: string },
            {db, req}: { db: Database, req: Request }
        ): Promise<Phone> => {
            await authorize(req, db);

            const userResult = await db.users.findOne({_id: new ObjectId(id)});
            if (!userResult) {
                throw new Error("User dose not exits.");
            }

            await db.users.updateOne(
                {_id: new ObjectId(id), "phones.id": phoneId},
                {$set: {"phones.$.number": number}}
            );

            const user = await db.users.findOne({_id: new ObjectId(id)});

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const phoneObject = user.phones.filter(phone => {
                if (phone.id == phoneId) {
                    return phone
                }
            });

            return phoneObject[0];
        },
        setPhoneNumberPrimary: async (
            _root: undefined,
            {id, phoneId}: { id: string, phoneId: string },
            {db, req}: { db: Database, req: Request }
        ): Promise<ICommonMessageReturnType> => {
            await authorize(req, db);

            const userResult = await db.users.findOne({_id: new ObjectId(id)});
            if (!userResult) {
                throw new Error("User dose not exits.");
            }

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const numbers = userResult.phones.map(phone => {
                if (phone.id == phoneId) {
                    return {
                        id: phone.id,
                        number: phone.number,
                        status: phone.status,
                        is_primary: true
                    }
                } else {
                    return {
                        id: phone.id,
                        number: phone.number,
                        status: phone.status,
                        is_primary: false
                    }
                }
            });

            await db.users.updateOne(
                {_id: new ObjectId(id)},
                {$set: {phones: numbers}}
            );

            return {
                status: true,
                message: "Set successfully."
            };
        },
        deletePhoneNumber: async (
            _root: undefined,
            {id, phoneId}: { id: string, phoneId: string },
            {db, req}: { db: Database, req: Request }
        ): Promise<ICommonMessageReturnType> => {
            await authorize(req, db);

            const userResult = await db.users.findOne({_id: new ObjectId(id)});
            if (!userResult) {
                throw new Error("User dose not exits.");
            }

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            if (userResult.phones.length == 1) {
                throw new Error("You are not allowed to delete your number.");
            }

            const numbers = [];
            const userPhones = userResult.phones;
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            for (let i = 0; i < userPhones.length; i++) {
                if (userPhones && userPhones[i].id != phoneId) {
                    numbers.push({
                        id: userPhones[i].id,
                        number: userPhones[i].number,
                        status: userPhones[i].status,
                        is_primary: true
                    });
                }
            }

            await db.users.updateOne(
                {_id: new ObjectId(id)},
                {$set: {phones: numbers}}
            );

            return {
                status: true,
                message: "Deleted successfully."
            };
        },
        addDeliveryAddress: async (
            _root: undefined,
            {id, title, address, division, district, region}: {
                id: string,
                title: string,
                address: string,
                division: string,
                district: string,
                region: string
            },
            {db, req}: { db: Database, req: Request }
        ): Promise<Address> => {
            await authorize(req, db);

            const userResult = await db.users.findOne({_id: new ObjectId(id)});
            if (!userResult) {
                throw new Error("User dose not exits.");
            }

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            if (userResult.delivery_address && userResult.delivery_address.length == 3) {
                throw new Error("Already added three address. You are not allowed to add more than three address.");
            }

            const newAddress = {
                id: shortid.generate(),
                title: title,
                address: address,
                division: division,
                district: district,
                region: region,
                is_primary: false,
            }

            await db.users.updateOne(
                {_id: new ObjectId(id)},
                {$push: {delivery_address: newAddress}}
            );

            return newAddress;
        },
        updateDeliveryAddress: async (
            _root: undefined,
            {id, addressId, title, address, division, district, region}: {
                id: string,
                addressId: string,
                title: string,
                address: string,
                division: string,
                district: string,
                region: string
            },
            {db, req}: { db: Database, req: Request }
        ): Promise<Address> => {
            await authorize(req, db);

            const userResult = await db.users.findOne({_id: new ObjectId(id)});
            if (!userResult) {
                throw new Error("User dose not exits.");
            }

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const matchedAddress = userResult.delivery_address.filter(address => {return address.id == addressId});
            const {id: id1, title: title1, address: address1, division: division1, district: district1, region: region1, is_primary} = matchedAddress[0];

            await db.users.updateOne(
                {_id: new ObjectId(id), "delivery_address.id": addressId},
                {
                    $set: {
                        "delivery_address.$.id": id1,
                        "delivery_address.$.title": title ? title : title1,
                        "delivery_address.$.address": address ? address : address1,
                        "delivery_address.$.division": division ? division : division1,
                        "delivery_address.$.district": district ? district : district1,
                        "delivery_address.$.region": region ? region : region1,
                        "delivery_address.$.is_primary": is_primary,
                    }
                }
            );

            const user = await db.users.findOne({_id: new ObjectId(id)});
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const updatedAddress = user.delivery_address.filter(address => {return address.id == addressId});

            return updatedAddress[0];
        },
        setDeliveryAddressPrimary: async (
            _root: undefined,
            {id, addressId}: { id: string, addressId: string },
            {db, req}: { db: Database, req: Request }
        ): Promise<ICommonMessageReturnType> => {
            await authorize(req, db);

            const userResult = await db.users.findOne({_id: new ObjectId(id)});
            if (!userResult) {
                throw new Error("User dose not exits.");
            }

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const addresses = userResult.delivery_address.map(address => {
                if (address.id == addressId) {
                    return {
                        id: address.id,
                        title: address.title,
                        address: address.address,
                        division: address.division,
                        district: address.district,
                        region: address.region,
                        is_primary: true
                    }
                } else {
                    return {
                        id: address.id,
                        title: address.title,
                        address: address.address,
                        division: address.division,
                        district: address.district,
                        region: address.region,
                        is_primary: false
                    }
                }
            });

            await db.users.updateOne(
                {_id: new ObjectId(id)},
                {$set: {delivery_address: addresses}}
            );

            return {
                status: true,
                message: "Set successfully."
            };
        },
        deleteDeliveryAddress: async (
            _root: undefined,
            {id, addressId}: { id: string, addressId: string },
            {db, req}: { db: Database, req: Request }
        ): Promise<ICommonMessageReturnType> => {
            await authorize(req, db);

            const userResult = await db.users.findOne({_id: new ObjectId(id)});
            if (!userResult) {
                throw new Error("User dose not exits.");
            }

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            if (userResult.delivery_address.length == 1) {
                throw new Error("You are not allowed to delete your address.");
            }


            const addresses = [];
            const userAddresses = userResult.delivery_address;
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            for (let i = 0; i < userAddresses.length; i++) {
                if (userAddresses && userAddresses[i].id != addressId) {
                    if (userAddresses) {
                        addresses.push({
                            id: userAddresses[i].id,
                            title: userAddresses[i].title,
                            address: userAddresses[i].address,
                            division: userAddresses[i].division,
                            district: userAddresses[i].district,
                            region: userAddresses[i].region,
                            is_primary: userAddresses[i].is_primary
                        });
                    }
                }
            }

            await db.users.updateOne(
                {_id: new ObjectId(id)},
                {$set: {delivery_address: addresses}}
            );

            return {
                status: true,
                message: "Deleted successfully."
            };
        },
        changePassword: async (
            _root: undefined,
            {id, old_password, new_password, confirm_password}: { id: string, old_password: string, new_password: string, confirm_password: string },
            {db, req}: { db: Database, req: Request }
        ): Promise<ICommonMessageReturnType> => {
            await authorize(req, db);

            const userResult = await db.users.findOne({_id: new ObjectId(id)});
            if (!userResult) {
                throw new Error("User dose not exits.");
            }

            const validatePass = await validatePassword(old_password, userResult.password);
            if (!validatePass || new_password != confirm_password) {
                throw new Error("Password dose not match.")
            }

            await db.users.updateOne(
                {_id: new ObjectId(id)},
                {$set: {password: await hashPassword(new_password)}}
            );

            return {
                status: true,
                message: "Changed successfully."
            };
        },
    },
    User: {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        id: (user: IUser): string => user._id.toString(),
    }
}