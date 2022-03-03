import { Resolver, Query, Mutation, Arg } from 'type-graphql';
import loadCoupons from './types.sample';
import Types from './types.type';

@Resolver()
export class TypesResolver {
  private readonly items: Types[] = loadCoupons();

  @Query(() => [Types], { description: 'Get all the coupon' })
  async types(): Promise<Types[]> {
    return await this.items;
  }
  @Mutation(() => Types)
  async applyCoupon(@Arg('code') code: string): Promise<Types> {
    const coupon = await this.items.find(
      item => item.code.toLowerCase() === code.toLowerCase()
    );

    if (coupon) {
      return coupon;
    }
    return {
      id: 0,
      code: 'DEFAULT_COUPON',
      discountInPercent: 0,
    };
  }
}
