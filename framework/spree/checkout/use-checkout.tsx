import { SWRHook } from '@commerce/utils/types'
import useCheckout, { UseCheckout } from '@commerce/checkout/use-checkout'

export default useCheckout as UseCheckout<typeof handler>

export const handler: SWRHook<any> = {
  // Provide fetchOptions for SWR cache key
  fetchOptions: {
    // TODO: Revise url and query once the integration supports checkout built into
    // NextJS Commerce.
    url: 'checkout',
    query: 'show',
  },
  async fetcher({ input, options, fetch }) {},
  useHook:
    ({ useData }) =>
    async (input) => ({}),
}
