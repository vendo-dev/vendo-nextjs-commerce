import checkoutApi from '@framework/api/endpoints/checkout'
import commerce from '@lib/api/commerce'
import { withSentry } from '@sentry/nextjs'

// TODO: Wrap all api endpoints once they're implemented by Spree.
export default withSentry(checkoutApi(commerce))
