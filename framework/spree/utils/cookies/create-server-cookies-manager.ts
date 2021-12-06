import { serialize } from 'cookie'
import type { CookieSerializeOptions } from 'cookie'
import type { NextApiRequest, NextApiResponse } from 'next'
import type { CookiesManager } from '../../types'

// Based on
// - https://github.com/js-cookie/js-cookie/blob/master/src/api.mjs
// - https://nextjs.org/docs/api-routes/api-middlewares

// FIXME: Encrypt cookies once they're managed exclusively server-side
// and not client- and server-side.

const createServerCookiesManager = ({
  request,
  response,
}: {
  request: NextApiRequest
  response: NextApiResponse
}): CookiesManager => {
  return {
    get: (cookieName) => {
      const savedCookieValue = request.cookies[cookieName]

      if (typeof savedCookieValue === 'undefined') {
        return null
      }

      return savedCookieValue
    },
    set: (cookieName, cookieValue, cookieOptions) => {
      const adaptedExpires =
        typeof cookieOptions.expires === 'number'
          ? new Date(cookieOptions.expires)
          : cookieOptions.expires
      const adaptedSameSite =
        cookieOptions.sameSite === 'Lax'
          ? 'lax'
          : cookieOptions.sameSite === 'Strict'
          ? 'strict'
          : cookieOptions.sameSite === 'None'
          ? 'none'
          : cookieOptions.sameSite
      const adaptedCookieOptions: CookieSerializeOptions = {
        ...cookieOptions,
        expires: adaptedExpires,
        sameSite: adaptedSameSite,
      }

      response.setHeader(
        'Set-Cookie',
        serialize(cookieName, cookieValue, adaptedCookieOptions)
      )
    },
    remove: (cookieName) => {
      response.setHeader(
        'Set-Cookie',
        serialize(cookieName, '', { expires: new Date('2000-01-01') })
      )
    },
  }
}

export default createServerCookiesManager
