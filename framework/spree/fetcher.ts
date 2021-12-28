import type { Fetcher } from '@commerce/utils/types'
import convertSpreeErrorToGraphQlError from './utils/convert-spree-error-to-graph-ql-error'
import { errors } from '@spree/storefront-api-v2-sdk'
import type { ResultResponse } from '@spree/storefront-api-v2-sdk/types/interfaces/ResultResponse'
import type { GraphQLFetcherResult } from '@commerce/api'
import getSpreeSdkMethodFromEndpointPath from './utils/get-spree-sdk-method-from-endpoint-path'
import SpreeSdkMethodFromEndpointPathError from './errors/SpreeSdkMethodFromEndpointPathError'
import type {
  FetcherVariables,
  SpreeSdkResponse,
  SpreeSdkResponseWithRawResponse,
} from './types'
import { fetchResponseKey } from './utils/create-customized-fetch-fetcher'
import getBrowserSpreeClient from './utils/spree-clients/get-browser-spree-client'

const normalizeSpreeSuccessResponse = (
  storeResponse: ResultResponse<SpreeSdkResponseWithRawResponse>
): GraphQLFetcherResult<SpreeSdkResponse> => {
  const data = storeResponse.success()
  const rawFetchResponse = data[fetchResponseKey]

  return {
    data,
    res: rawFetchResponse,
  }
}

const spreeClient = getBrowserSpreeClient()

const fetcher: Fetcher<GraphQLFetcherResult<SpreeSdkResponse>> = async (
  requestOptions
) => {
  const { url, method, variables, query } = requestOptions

  console.log(
    'Fetcher called. Configuration: ',
    'url = ',
    url,
    'requestOptions = ',
    requestOptions
  )

  if (!variables) {
    throw new SpreeSdkMethodFromEndpointPathError(
      `Required FetcherVariables not provided.`
    )
  }

  const { methodPath, arguments: args } = variables as FetcherVariables

  const spreeSdkMethod = getSpreeSdkMethodFromEndpointPath(
    spreeClient,
    methodPath
  )

  const storeResponse: ResultResponse<SpreeSdkResponseWithRawResponse> =
    await spreeSdkMethod(...args)

  if (storeResponse.isSuccess()) {
    return normalizeSpreeSuccessResponse(storeResponse)
  }

  const storeResponseError = storeResponse.fail()

  if (storeResponseError instanceof errors.SpreeError) {
    throw convertSpreeErrorToGraphQlError(storeResponseError)
  }

  throw storeResponseError
}

export default fetcher
