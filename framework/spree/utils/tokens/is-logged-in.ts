import withBrowserCookies from '../cookies/with-browser-cookies'
import { ensureUserTokenResponse } from './user-token-response'

const isLoggedIn = (): boolean => {
  const userTokenResponse = withBrowserCookies(ensureUserTokenResponse)({})

  return !!userTokenResponse
}

export default isLoggedIn
