import { CookiesManager, SpreeSdkResponseWithRawResponse } from '../../types'
import type { Client } from '@spree/storefront-api-v2-sdk'
import type { IOAuthToken } from '@spree/storefront-api-v2-sdk/types/interfaces/Token'
import getSpreeSdkMethodFromEndpointPath from '../get-spree-sdk-method-from-endpoint-path'
import {
  ensureUserTokenResponse,
  removeUserTokenResponse,
  setUserTokenResponse,
} from './user-token-response'
import AccessTokenError from '../../errors/AccessTokenError'

/**
 * If the user has a saved access token, make sure it's not expired
 * If it is expired, attempt to refresh it.
 */
const ensureFreshUserAccessToken = async ({
  cookiesManager,
  client,
}: {
  cookiesManager: CookiesManager
  client: Client
}): Promise<void> => {
  const userTokenResponse = ensureUserTokenResponse({ cookiesManager })

  if (!userTokenResponse) {
    // There's no user token or it has an invalid format.
    return
  }

  const isAccessTokenExpired =
    (userTokenResponse.created_at + userTokenResponse.expires_in) * 1000 <
    Date.now()

  if (!isAccessTokenExpired) {
    return
  }

  const spreeRefreshAccessTokenSdkMethod = getSpreeSdkMethodFromEndpointPath<
    Client,
    SpreeSdkResponseWithRawResponse & IOAuthToken
  >(client, 'authentication.refreshToken')

  const spreeRefreshAccessTokenResponse =
    await spreeRefreshAccessTokenSdkMethod({
      refresh_token: userTokenResponse.refresh_token,
    })

  if (spreeRefreshAccessTokenResponse.isFail()) {
    removeUserTokenResponse({ cookiesManager })

    throw new AccessTokenError('Could not refresh access token.')
  }

  setUserTokenResponse({
    cookiesManager,
    token: spreeRefreshAccessTokenResponse.success(),
  })
}

export default ensureFreshUserAccessToken
