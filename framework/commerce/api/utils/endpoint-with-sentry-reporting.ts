import * as Sentry from '@sentry/nextjs'
import type { GetAPISchema } from '..'

const endpointWithSentryReporting = <
  P extends GetAPISchema<any, any>['endpoint']
>(
  endpoint: P
): P => {
  const handlers = endpoint.handlers

  const reportingHandlers = Object.keys(handlers).reduce(
    (accumulatedHandlers, handlerKey) => {
      const handlerFunction = handlers[handlerKey]

      const wrappedHandler: typeof handlerFunction = async (context) => {
        try {
          return await handlerFunction(context)
        } catch (error) {
          Sentry.captureException(error)

          throw error
        }
      }

      return {
        ...accumulatedHandlers,
        [handlerKey]: wrappedHandler,
      }
    },
    {}
  )

  return {
    ...endpoint,
    handlers: reportingHandlers,
  }
}

export default endpointWithSentryReporting
