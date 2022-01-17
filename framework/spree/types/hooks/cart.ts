import type { CartTypes, Cart } from '@commerce/types/cart'
import type { Discount } from '@commerce/types/common'

export type SpreeDiscount = Discount & {
  name?: string
}

export type SpreeCart = Cart & {
  discounts?: SpreeDiscount[]
}

export type SpreeCartTypes = CartTypes & {
  cart?: SpreeCart
}

export type AddCouponCodeHook<T extends SpreeCartTypes = SpreeCartTypes> = {
  data: T['cart'] | null
  input?: { couponCode: string }
  fetcherInput: { couponCode: string }
  body: { couponCode: string }
  actionInput: { couponCode: string }
}

export type RemoveAllCouponsHook<T extends SpreeCartTypes = SpreeCartTypes> = {
  data: T['cart'] | null
  input: undefined
  fetcherInput: undefined
  body: undefined
  actionInput: undefined
}
