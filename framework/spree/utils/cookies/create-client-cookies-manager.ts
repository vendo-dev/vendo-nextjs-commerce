import type { CookiesManager } from '@framework/types'
import Cookies from 'js-cookie'

const createClientCookiesManager = (): CookiesManager => {
  return {
    get: (cookieName) => {
      const savedCookieValue = Cookies.get(cookieName)

      if (typeof savedCookieValue === 'undefined') {
        return null
      }

      return savedCookieValue
    },
    set: (cookieName, cookieValue, cookieOptions) => {
      Cookies.set(cookieName, cookieValue, cookieOptions)
    },
    remove: (cookieName) => {
      Cookies.remove(cookieName)
    },
  }
}

export default createClientCookiesManager
