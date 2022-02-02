import merge from "lodash.merge";
import {usersResolvers} from "./User";
import {typesResolvers} from "./Type";
import {categoriesResolvers} from "./Category";
import {productsResolvers} from "./Product";
import {deliveryMethodsResolvers} from "./DeliveryMethod";
import {paymentOptionsResolvers} from "./PaymentOption";
import {ordersResolvers} from "./Orders";
import {settingsResolvers} from "./Setting";
import {couponsResolvers} from "./Coupon";
import {homeCardsResolvers} from "./HomeCard";

export const resolvers = merge(
    usersResolvers,
    typesResolvers,
    categoriesResolvers,
    productsResolvers,
    deliveryMethodsResolvers,
    paymentOptionsResolvers,
    ordersResolvers,
    settingsResolvers,
    couponsResolvers,
    homeCardsResolvers
);