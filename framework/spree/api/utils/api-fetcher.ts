import { errors } from '@spree/storefront-api-v2-sdk'
import convertSpreeErrorToGraphQlError from '../../utils/convert-spree-error-to-graph-ql-error'
import type { ResultResponse } from '@spree/storefront-api-v2-sdk/types/interfaces/ResultResponse'
import getSpreeSdkMethodFromEndpointPath from '../../utils/get-spree-sdk-method-from-endpoint-path'
import SpreeSdkMethodFromEndpointPathError from '../../errors/SpreeSdkMethodFromEndpointPathError'
import { GraphQLFetcher, GraphQLFetcherResult } from '@commerce/api'
import { fetchResponseKey } from '../../utils/create-customized-fetch-fetcher'
import type {
  FetcherVariables,
  SpreeSdkResponseWithRawResponse,
} from '../../types'
import getServerSpreeClient from '../../utils/spree-clients/get-server-spree-client'
import prettyPrintSpreeSdkErrors from '../../utils/pretty-print-spree-sdk-errors'

// TODO: GraphQLFetcher<GraphQLFetcherResult<any>, any> should be GraphQLFetcher<GraphQLFetcherResult<any>, SpreeSdkVariables>.
// But CommerceAPIConfig['fetch'] cannot be extended from Variables = any to SpreeSdkVariables.

const spreeClient = getServerSpreeClient()

const apiFetcher: GraphQLFetcher<GraphQLFetcherResult<any>, any> = async (
  url,
  queryData = {},
  fetchOptions = {}
) => {
  console.log(
    'apiFetch called. query = ',
    'url = ',
    url,
    'queryData = ',
    queryData,
    'fetchOptions = ',
    fetchOptions
  )

  const { variables } = queryData

  if (!variables) {
    throw new SpreeSdkMethodFromEndpointPathError(
      `Required SpreeSdkVariables not provided.`
    )
  }

  const { methodPath, arguments: args } = variables as FetcherVariables

  const storeResponse: ResultResponse<SpreeSdkResponseWithRawResponse> =
    await getSpreeSdkMethodFromEndpointPath(spreeClient, methodPath)(...args)

  if (storeResponse.isSuccess()) {
    const data = storeResponse.success()
    const rawFetchResponse = data[fetchResponseKey]

    return {
      data,
      res: rawFetchResponse,
    }
  }

  const storeResponseError = storeResponse.fail()

  if (storeResponseError instanceof errors.SpreeError) {
    console.error(
      `Request to spree resulted in an error:\n\n${prettyPrintSpreeSdkErrors(
        storeResponse.fail()
      )}`
    )

    throw convertSpreeErrorToGraphQlError(storeResponseError)
  }

  throw storeResponseError
}

export default apiFetcher
