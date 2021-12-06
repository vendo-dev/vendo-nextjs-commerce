import { requireConfigValue } from '../../isomorphic-config'
import type { CookiesManager } from '@framework/types'

export const getCartToken = ({
  cookiesManager,
}: {
  cookiesManager: CookiesManager
}): string | null =>
  cookiesManager.get(requireConfigValue('cartCookieName') as string)

export const setCartToken = ({
  cartToken,
  cookiesManager,
}: {
  cartToken: string
  cookiesManager: CookiesManager
}) => {
  const cookieOptions = {
    expires: requireConfigValue('cartCookieExpire') as number,
  }

  cookiesManager.set(
    requireConfigValue('cartCookieName') as string,
    cartToken,
    cookieOptions
  )
}

export const removeCartToken = ({
  cookiesManager,
}: {
  cookiesManager: CookiesManager
}) => {
  cookiesManager.remove(requireConfigValue('cartCookieName') as string)
}
