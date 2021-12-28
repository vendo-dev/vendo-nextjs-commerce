import { makeClient } from '@spree/storefront-api-v2-sdk'
import { requireConfigValue } from '../../isomorphic-config'
import createCustomizedFetchFetcher from '../create-customized-fetch-fetcher'

const serverSpreeClient = makeClient({
  host: requireConfigValue('apiHost') as string,
  createFetcher: (fetcherOptions) => {
    return createCustomizedFetchFetcher({
      fetch,
      requestConstructor: Request,
      ...fetcherOptions,
    })
  },
})

const getServerSpreeClient = () => serverSpreeClient

export default getServerSpreeClient
