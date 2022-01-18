import { useCallback } from 'react'
import type { MutationHook } from '@commerce/utils/types'
import type { ApplyCouponCodeOptions } from '@spree/storefront-api-v2-sdk/types/interfaces/Cart'
import type { RequiredAnyToken } from '@spree/storefront-api-v2-sdk/types/interfaces/Token'
import type { GraphQLFetcherResult } from '@commerce/api'
import type { IOrder } from '@spree/storefront-api-v2-sdk/types/interfaces/Order'
import useCart from './use-cart'
import MissingTokenError from '../errors/MissingTokenError'
import withBrowserCookies from '../utils/cookies/with-browser-cookies'
import { ensureAnyToken } from '../utils/tokens/ensure-itoken'
import normalizeCart from '../utils/normalizations/normalize-cart'
import type { AddCouponCodeHook } from '../types/hooks/cart'
import useAddCouponCode, { UseAddCouponCode } from './hooks/use-add-coupon-code'

export default useAddCouponCode as UseAddCouponCode<typeof handler>

export const handler: MutationHook<AddCouponCodeHook> = {
  // Provide fetchOptions for SWR cache key
  fetchOptions: {
    url: 'cart',
    query: 'addCouponCode',
  },
  async fetcher({ input, options, fetch }) {
    console.info(
      'useAddCouponCode fetcher called. Configuration: ',
      'input: ',
      input,
      'options: ',
      options
    )

    const { couponCode } = input

    let token: RequiredAnyToken | undefined = withBrowserCookies(
      ensureAnyToken
    )({})

    if (!token) {
      throw new MissingTokenError()
    }

    const addCouponCodeParameters: ApplyCouponCodeOptions = {
      ...token,
      coupon_code: couponCode,
      include: [
        'line_items',
        'line_items.variant',
        'line_items.variant.product',
        'line_items.variant.product.images',
        'line_items.variant.images',
        'line_items.variant.option_values',
        'line_items.variant.product.option_types',
        'promotions',
      ].join(','),
    }

    const { data: spreeSuccessResponse } = await fetch<
      GraphQLFetcherResult<IOrder>
    >({
      variables: {
        methodPath: 'cart.applyCouponCode',
        arguments: [addCouponCodeParameters],
      },
    })

    return normalizeCart(spreeSuccessResponse, spreeSuccessResponse.data)
  },
  useHook: ({ fetch }) => {
    const useWrappedHook: ReturnType<
      MutationHook<AddCouponCodeHook>['useHook']
    > = () => {
      const { mutate } = useCart()

      return useCallback(
        async (input) => {
          const data = await fetch({ input })

          await mutate(data, false)

          return data
        },
        [mutate]
      )
    }

    return useWrappedHook
  },
}
