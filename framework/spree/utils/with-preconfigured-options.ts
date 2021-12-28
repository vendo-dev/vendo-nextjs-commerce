const withPreconfiguredOptions = <
  P extends (customOptions: any) => any,
  W extends Parameters<P>[0],
  M extends ReturnType<P>,
  U extends keyof W,
  H extends Partial<Pick<W, U>>
>(
  callbackFunction: P,
  partialOptions: H
) => {
  return (customOptions: Omit<W, keyof H> & Partial<H>): M => {
    const completeOptions = {
      ...partialOptions,
      ...customOptions,
    }

    return callbackFunction(completeOptions)
  }
}

export default withPreconfiguredOptions
