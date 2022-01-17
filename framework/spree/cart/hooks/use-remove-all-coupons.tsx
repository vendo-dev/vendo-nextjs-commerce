import { useHook, useMutationHook } from '../../../commerce/utils/use-hook'
import { mutationFetcher } from '../../../commerce/utils/default-fetcher'
import type { HookFetcherFn, MutationHook } from '../../../commerce/utils/types'
import type { RemoveAllCouponsHook } from '../../types/hooks/cart'
import type { SpreeProvider } from '../../provider'

export type UseRemoveAllCoupons<
  H extends MutationHook<
    RemoveAllCouponsHook<any>
  > = MutationHook<RemoveAllCouponsHook>
> = ReturnType<H['useHook']>

export const fetcher: HookFetcherFn<RemoveAllCouponsHook> = mutationFetcher

const fn = (provider: SpreeProvider) => provider.cart.useRemoveAllCoupons

const useAddCouponCode: UseRemoveAllCoupons = (...args) => {
  const hook = useHook(fn)
  return useMutationHook({ fetcher, ...hook })(...args)
}

export default useAddCouponCode
