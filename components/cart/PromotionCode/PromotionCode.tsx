import { useCallback, useEffect, useMemo, useState } from 'react'
import cn from 'classnames'
import { Button, Input } from '@components/ui'
import s from './PromotionCode.module.css'
import { FetcherError } from '@commerce/utils/errors'
import useCart from '@framework/cart/use-cart'
import useAddCouponCode from '@framework/cart/hooks/use-add-coupon-code'
import useRemoveAllCoupons from '@framework/cart/hooks/use-remove-all-coupons'

const getNextId = (() => {
  let id = 0

  return () => `${++id}`
})()

const PromotionCode = () => {
  const cart = useCart()
  const addCouponCode = useAddCouponCode()
  const removeAllCoupons = useRemoveAllCoupons()
  const [errorMessage, setErrorMessage] = useState<null | string>(null)
  const [loading, setLoading] = useState(false)
  const [couponCode, setCouponCode] = useState('')
  const [submitAddCouponDisabled, setSubmitAddCouponDisabled] = useState(false)
  const [submitRemoveAllCouponsDisabled, setSubmitRemoveAllCouponsDisabled] =
    useState(false)
  const [dirty, setDirty] = useState(false)
  const inputId = useMemo(() => getNextId(), [])

  const validate = useCallback(() => {
    const valid = couponCode.length > 0

    setErrorMessage(null)

    if (valid) {
      setSubmitAddCouponDisabled(false)

      return true
    }

    setSubmitAddCouponDisabled(true)

    return false
  }, [couponCode])

  const handleCouponCodeChange = useCallback(
    (code) => {
      setCouponCode(code)
      setDirty(true)
      validate()
    },
    [validate]
  )

  const handleAddSubmit = useCallback(
    async (event) => {
      event.preventDefault()

      setDirty(true)

      const canSubmit = validate()

      if (canSubmit) {
        try {
          setLoading(true)
          setSubmitAddCouponDisabled(true)

          await addCouponCode({ couponCode })

          setLoading(false)
          setSubmitAddCouponDisabled(false)
          setErrorMessage(null)
          setCouponCode('')
        } catch (error) {
          if (!(error instanceof FetcherError)) {
            throw error
          }

          setErrorMessage(error.message)

          setLoading(false)
        }
      }
    },
    [validate, couponCode, addCouponCode]
  )

  const handleRemoveSubmit = useCallback(
    async (event) => {
      event.preventDefault()

      try {
        setLoading(true)
        setSubmitRemoveAllCouponsDisabled(true)

        await removeAllCoupons()

        setLoading(false)
        setSubmitRemoveAllCouponsDisabled(false)
        setErrorMessage(null)
      } catch (error) {
        if (!(error instanceof FetcherError)) {
          throw error
        }

        setErrorMessage(error.message)

        setSubmitRemoveAllCouponsDisabled(false)
        setLoading(false)
      }
    },
    [removeAllCoupons]
  )

  useEffect(() => {
    validate()
  }, [validate])

  useEffect(() => {
    // If there are any changes in the cart, revalidate the promo code.
    // Some promotions depend on the contents of the cart.
    validate()
  }, [cart.data, validate])

  if (!cart.data) {
    return null
  }

  const cartHasCoupon = cart.data.discounts
    ? cart.data.discounts.length > 0
    : false

  const errorMessageColumn =
    (dirty && errorMessage && (
      <div className="col-span-12">
        <div className="text-red border border-red p-3 mt-4">
          <span className="sr-only">Error: </span>
          {errorMessage}
        </div>
      </div>
    )) ||
    null

  if (cartHasCoupon) {
    const coupon = cart.data.discounts![0]

    return (
      <form onSubmit={handleRemoveSubmit}>
        <div>
          <div className="grid gap-3 grid-flow-row grid-cols-12">
            {errorMessageColumn}
            <div className={cn('col-span-8', 'justify-center', s.fieldset)}>
              <span>
                Applied promotion:{' '}
                <span className="font-bold tracking-wide break-words">
                  {coupon.name}
                </span>
              </span>
            </div>
            <div className={cn('col-span-4', 'justify-center', s.fieldset)}>
              <Button
                type="submit"
                width="100%"
                variant="ghost"
                className={s.submitButton}
                loading={loading}
                disabled={submitRemoveAllCouponsDisabled}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </form>
    )
  }

  return (
    <form onSubmit={handleAddSubmit}>
      <div className="grid gap-3 grid-flow-row grid-cols-12">
        {errorMessageColumn}
        <div className={cn('col-span-8', s.fieldset)}>
          <label className={s.label} htmlFor={inputId}>
            Promo code
          </label>

          <Input
            id={`#${inputId}`}
            className={cn(s.input, s.couponCodeInput)}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            name="coupon_code"
            onChange={handleCouponCodeChange}
          />
        </div>
        <div className={cn('col-span-4', 'justify-end', s.fieldset)}>
          <Button
            type="submit"
            width="100%"
            variant="ghost"
            className={s.submitButton}
            loading={loading}
            disabled={submitAddCouponDisabled}
          >
            Apply
          </Button>
        </div>
      </div>
    </form>
  )
}

export default PromotionCode
