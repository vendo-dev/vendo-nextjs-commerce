import { makeClient } from '@spree/storefront-api-v2-sdk'
import { requireConfigValue } from '../../isomorphic-config'
import createCustomizedFetchFetcher from '../create-customized-fetch-fetcher'

const browserSpreeClient = makeClient({
  host: requireConfigValue('apiHost') as string,
  createFetcher: (fetcherOptions) => {
    return createCustomizedFetchFetcher({
      fetch: globalThis.fetch,
      requestConstructor: globalThis.Request,
      ...fetcherOptions,
    })
  },
})

const getBrowserSpreeClient = () => browserSpreeClient

export default getBrowserSpreeClient
