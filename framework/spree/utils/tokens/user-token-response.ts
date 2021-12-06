import { requireConfigValue } from '../../isomorphic-config'
import type { IOAuthToken } from '@spree/storefront-api-v2-sdk/types/interfaces/Token'
import UserTokenResponseParseError from '../../errors/UserTokenResponseParseError'
import type { CookiesManager } from '../../types'

export const getUserTokenResponse = ({
  cookiesManager,
}: {
  cookiesManager: CookiesManager
}): IOAuthToken | null => {
  const stringifiedToken = cookiesManager.get(
    requireConfigValue('userCookieName') as string
  )

  if (!stringifiedToken) {
    return null
  }

  try {
    const token: IOAuthToken = JSON.parse(stringifiedToken)

    return token
  } catch (parseError) {
    throw new UserTokenResponseParseError(
      'Could not parse stored user token response.'
    )
  }
}

/**
 * Retrieves the saved user token response. If the response fails json parsing,
 * removes the saved token and returns @type {undefined} instead.
 */
export const ensureUserTokenResponse = ({
  cookiesManager,
}: {
  cookiesManager: CookiesManager
}): IOAuthToken | null => {
  try {
    return getUserTokenResponse({ cookiesManager })
  } catch (error) {
    if (error instanceof UserTokenResponseParseError) {
      removeUserTokenResponse({ cookiesManager })

      return null
    }

    throw error
  }
}

export const setUserTokenResponse = ({
  token,
  cookiesManager,
}: {
  token: IOAuthToken
  cookiesManager: CookiesManager
}) => {
  const cookieOptions = {
    expires: requireConfigValue('userCookieExpire') as number,
  }

  cookiesManager.set(
    requireConfigValue('userCookieName') as string,
    JSON.stringify(token),
    cookieOptions
  )
}

export const removeUserTokenResponse = ({
  cookiesManager,
}: {
  cookiesManager: CookiesManager
}) => {
  cookiesManager.remove(requireConfigValue('userCookieName') as string)
}
