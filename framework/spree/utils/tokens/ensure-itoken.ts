import type { CookiesManager } from '../../types'
import type {
  RequiredAnyToken,
  IToken,
} from '@spree/storefront-api-v2-sdk/types/interfaces/Token'
import { getCartToken } from './cart-token'
import { ensureUserTokenResponse } from './user-token-response'

const ensureAnyToken = ({
  cookiesManager,
}: {
  cookiesManager: CookiesManager
}): RequiredAnyToken | undefined => {
  const userTokenResponse = ensureUserTokenResponse({ cookiesManager })

  if (userTokenResponse) {
    return {
      bearer_token: userTokenResponse.access_token,
    }
  }

  const cartToken = getCartToken({ cookiesManager })

  if (cartToken) {
    return {
      order_token: cartToken,
    }
  }

  return undefined
}

// TODO: Convert all ensureIToken calls to ensureAnyToken as recommended by Spree SDK.
const ensureIToken = ({
  cookiesManager,
}: {
  cookiesManager: CookiesManager
}): IToken | undefined => {
  const anyToken = ensureAnyToken({ cookiesManager })

  if (!anyToken) return undefined

  const iToken: IToken = {}

  if (anyToken.bearer_token) {
    iToken.bearerToken = anyToken.bearer_token
  }

  if (anyToken.order_token) {
    iToken.orderToken = anyToken.order_token
  }

  return iToken
}

export { ensureAnyToken }

export default ensureIToken
