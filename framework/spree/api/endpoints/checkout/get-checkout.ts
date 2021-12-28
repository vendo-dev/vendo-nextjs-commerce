import type { CheckoutEndpoint } from '.'
import { requireConfigValue } from '../../../isomorphic-config'
import type { IToken } from '@spree/storefront-api-v2-sdk/types/interfaces/Token'
import ensureIToken from '../../../utils/tokens/ensure-itoken'
import MissingTokenError from '../../../errors/MissingTokenError'
import createServerCookiesManager from '../../../utils/cookies/create-server-cookies-manager'
import withPreconfiguredOptions from '../../../utils/with-preconfigured-options'
import ensureFreshUserAccessToken from '../../../utils/tokens/ensure-fresh-user-access-token'
import getServerSpreeClient from '../../../utils/spree-clients/get-server-spree-client'
import type { SpreeSdkVariables } from '../../../types'
import type { StripeCheckoutSessionSummary } from '@spree/storefront-api-v2-sdk/types/interfaces/StripeCheckoutSessionSummary'
import { FetcherError } from '../../../../commerce/utils/errors'
import MissingCartError from '../../../errors/MissingCartError'

// TODO: Wrap entire API endpoints using a higher-order function running ensureFreshUserAccessToken
// to ensure there's a logged in user in cookie. For example,
// https://github.com/vvo/iron-session/blob/main/examples/next.js-typescript/pages/api/user.ts

const unknownErrorMessage =
  'Something went wrong. The issue was reported. Try again.'

const missingCartErrorMessage = 'Add products to the cart and try again.'

const unhandledErrorCheckoutTemplate = (message: string): string => `
<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Checkout</title>
  </head>
  <body>
    <div style='margin: 10rem auto; text-align: center; font-family: SansSerif, "Segoe UI", Helvetica; color: #888;'>
       <svg xmlns="http://www.w3.org/2000/svg" style='height: 60px; width: 60px;' fill="none" viewBox="0 0 24 24" stroke="currentColor">
         <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
       </svg>
       <h1>An unexpected error occurred</h1>
       <p>${message}</p>
    </div>
  </body>
</html>
`

const spreeClient = getServerSpreeClient()

// Note, a NextJS API endpoint is used in NJC to render HTML to a user.
const getCheckout: CheckoutEndpoint['handlers']['getCheckout'] = async ({
  req: request,
  res: response,
  config,
}) => {
  console.log('getCheckout called. Configuration: ', config)

  const { fetch: apiFetch } = config

  try {
    const cookiesManager = createServerCookiesManager({ request, response })
    await withPreconfiguredOptions(ensureFreshUserAccessToken, {
      cookiesManager,
    })({ client: spreeClient })

    const token: IToken | undefined = withPreconfiguredOptions(ensureIToken, {
      cookiesManager,
    })({})

    if (!token) {
      throw new MissingTokenError()
    }

    const variables: SpreeSdkVariables = {
      methodPath: 'checkout.createStripeSession',
      arguments: [
        {
          ...token,
          success_url: requireConfigValue('stripeSuccessUrl') as string,
          cancel_url: requireConfigValue('stripeCancelUrl') as string,
        },
      ],
    }

    const { data: spreeCreateStripeSessionSuccessResponse } = await apiFetch<
      StripeCheckoutSessionSummary,
      SpreeSdkVariables
    >('__UNUSED__', { variables }).catch((error) => {
      if (error instanceof FetcherError && error.status === 404) {
        throw new MissingCartError()
      }

      throw error
    })

    const stripeSessionUrl = spreeCreateStripeSessionSuccessResponse.session_url

    response.redirect(303, stripeSessionUrl)
  } catch (error) {
    console.error('Cannot visit checkout. Error: ', error)

    if (error instanceof MissingTokenError) {
      // NJC doesn't have any generic component for displaying errors.
      // Just redirect to the homepage.
      response.redirect(303, '/')

      return
    }

    if (error instanceof MissingCartError) {
      response.status(422)
      response.setHeader('Content-Type', 'text/html')
      response.write(unhandledErrorCheckoutTemplate(missingCartErrorMessage))
      response.end()

      return
    }

    response.status(500)
    response.setHeader('Content-Type', 'text/html')
    response.write(unhandledErrorCheckoutTemplate(unknownErrorMessage))
    response.end()
  }
}

export default getCheckout
