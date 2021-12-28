import type { AnyFunction } from '../types'

const beforeAsynchronous = <
  O extends AnyFunction,
  UnwrappedReturn extends ReturnType<O> extends Promise<infer U>
    ? U
    : ReturnType<O> extends infer U
    ? U
    : never,
  P extends (...args: Parameters<O>) => void | Promise<void>
>(
  beforeFunction: P
) => {
  return (callbackFunction: O) => {
    return (...args: Parameters<O>): Promise<UnwrappedReturn> => {
      return Promise.resolve(beforeFunction(...args)).then(() => {
        return callbackFunction(...args)
      })
    }
  }
}

export default beforeAsynchronous
