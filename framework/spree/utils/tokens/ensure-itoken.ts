import type { CookiesManager } from '../../types'
import type { IToken } from '@spree/storefront-api-v2-sdk/types/interfaces/Token'
import { getCartToken } from './cart-token'
import { ensureUserTokenResponse } from './user-token-response'

const ensureIToken = ({
  cookiesManager,
}: {
  cookiesManager: CookiesManager
}): IToken | undefined => {
  const userTokenResponse = ensureUserTokenResponse({ cookiesManager })

  if (userTokenResponse) {
    return {
      bearerToken: userTokenResponse.access_token,
    }
  }

  const cartToken = getCartToken({ cookiesManager })

  if (cartToken) {
    return {
      orderToken: cartToken,
    }
  }

  return undefined
}

export default ensureIToken
