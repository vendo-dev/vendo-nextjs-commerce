import withPreconfiguredOptions from '../with-preconfigured-options'
import createClientCookiesManager from './create-client-cookies-manager'

const cookiesManager = createClientCookiesManager()

const withBrowserCookies = (callbackFunction: (customOptions: any) => any) =>
  withPreconfiguredOptions(callbackFunction, {
    cookiesManager,
  })

export default withBrowserCookies
