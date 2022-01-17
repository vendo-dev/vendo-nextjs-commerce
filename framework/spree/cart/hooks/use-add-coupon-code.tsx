import { useHook, useMutationHook } from '../../../commerce/utils/use-hook'
import { mutationFetcher } from '../../../commerce/utils/default-fetcher'
import type { HookFetcherFn, MutationHook } from '../../../commerce/utils/types'
import type { AddCouponCodeHook } from '../../types/hooks/cart'
import type { SpreeProvider } from '../../provider'

export type UseAddCouponCode<
  H extends MutationHook<
    AddCouponCodeHook<any>
  > = MutationHook<AddCouponCodeHook>
> = ReturnType<H['useHook']>

export const fetcher: HookFetcherFn<AddCouponCodeHook> = mutationFetcher

const fn = (provider: SpreeProvider) => provider.cart.useAddCouponCode

const useAddCouponCode: UseAddCouponCode = (...args) => {
  const hook = useHook(fn)
  return useMutationHook({ fetcher, ...hook })(...args)
}

export default useAddCouponCode
