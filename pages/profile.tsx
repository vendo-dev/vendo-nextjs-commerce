import type { GetStaticPropsContext } from 'next'
import useCustomer from '@framework/customer/use-customer'
import commerce from '@lib/api/commerce'
import { Layout } from '@components/common'
import { Button, Container, Input, Text } from '@components/ui'
import { useEffect, useState } from 'react'
import getBrowserSpreeClient from '@framework/utils/spree-clients/get-browser-spree-client'
import { ensureAnyToken } from '@framework/utils/tokens/ensure-itoken'
import withBrowserCookies from '@framework/utils/cookies/with-browser-cookies'
import { RequiredAnyToken } from '@spree/storefront-api-v2-sdk/types/interfaces/Token'
import _ from 'lodash'
import { FieldError, useForm } from 'react-hook-form'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { UpdateOptions } from '@spree/storefront-api-v2-sdk/types/interfaces/Account'

export async function getStaticProps({
  preview,
  locale,
  locales,
}: GetStaticPropsContext) {
  const config = { locale, locales }
  const pagesPromise = commerce.getAllPages({ config, preview })
  const siteInfoPromise = commerce.getSiteInfo({ config, preview })
  const { pages } = await pagesPromise
  const { categories } = await siteInfoPromise

  return {
    props: { pages, categories },
  }
}

type FieldName = 'firstName' | 'lastName' | 'email'

interface IUpdateAccountParams {
  bearer_token: string | undefined
  user: { last_name: string; first_name: string; email: string }
}

export default function Profile() {
  const { data } = useCustomer()
  const [isEdited, setIsEdited] = useState(false)
  const [userUpdatedData, setUserUpdatedData] = useState(data)

  type FormInputs = {
    firstName: string
    lastName: string
    email: string
  }

  const schema = yup
    .object({
      firstName: yup.string().required(),
      lastName: yup.string().required(),
      email: yup.string().email().required(),
    })
    .required()

  const errorMessage = (error: FieldError | undefined) => {
    if (!error?.message) return null
    const splittedMessage = error.message.split(' ')
    return [
      _.upperFirst(_.lowerCase(splittedMessage[0])),
      ...splittedMessage.splice(1),
    ].join(' ')
  }

  const {
    clearErrors,
    getValues,
    handleSubmit,
    register,
    reset,
    setError,
    setValue,
    formState: { errors },
  } = useForm<FormInputs>({
    resolver: yupResolver(schema),
  })
  useEffect(() => {
    data && reset({ ...getValues(), ...data, ...userUpdatedData })
  }, [reset, data, getValues, userUpdatedData])

  const inputProps = (attrName: 'firstName' | 'lastName' | 'email') => ({
    register: register(attrName),
    placeholder: _.lowerCase(attrName),
    defaultValue: userUpdatedData ? userUpdatedData[attrName] : data[attrName],
    onChange: (val: string) => {
      clearErrors(attrName)
      setValue(attrName, val)
    },
  })

  function setErrorsFromResponse(updateErrors: {
    first_name: string | undefined
    last_name: string | undefined
    email: string | undefined
  }) {
    Object.entries(updateErrors).forEach(([k, subjectlessSentence]) => {
      const formattedKeyInArray = _.lowerCase(k).split(' ')
      setError(_.camelCase(k) as FieldName, {
        message: `${_.startCase(
          formattedKeyInArray[0]
        )} ${formattedKeyInArray.slice(1)} ${subjectlessSentence}`,
      })
    })
  }

  class SpreeSDKErrorExt extends Error {
    errors: {
      first_name: string | undefined
      last_name: string | undefined
      email: string | undefined
    }
    constructor(message: string) {
      super(message)
      Object.setPrototypeOf(this, SpreeSDKErrorExt.prototype)
      this.name = 'SpreeSDKErrorExt'
      this.errors = {
        first_name: undefined,
        last_name: undefined,
        email: undefined,
      }
    }
  }

  const updateAccount = async (data: FormInputs) => {
    const spreeClient = getBrowserSpreeClient()
    const token: RequiredAnyToken | undefined = withBrowserCookies(
      ensureAnyToken
    )({})
    const updateParams: IUpdateAccountParams = {
      bearer_token: token?.bearer_token,
      user: {
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
      },
    }
    const updateResponse = await spreeClient.account.update(
      updateParams as unknown as UpdateOptions
    )
    if (updateResponse.isSuccess()) {
      setUserUpdatedData(data)
      setIsEdited(false)
    } else {
      // We should be able to remove type casting and SpreeSDKErrorExt definition with the future SDK update
      setErrorsFromResponse((updateResponse.fail() as SpreeSDKErrorExt).errors)
    }
  }

  return (
    <Container>
      <Text variant="pageHeading">My Profile</Text>
      {data && (
        <div className="grid lg:grid-cols-12">
          <div className="lg:col-span-8 pr-4">
            <div>
              <Text variant="sectionHeading">Full Name</Text>
              {isEdited ? (
                <>
                  <div className="account-page-user-info-item-definition__form">
                    <Input {...inputProps('firstName')} />
                    <Input className="mt-2" {...inputProps('lastName')} />
                  </div>
                  <div>{errorMessage(errors['firstName'])}</div>
                  <div>{errorMessage(errors['lastName'])}</div>
                </>
              ) : (
                <span>
                  {userUpdatedData?.firstName || data.firstName}{' '}
                  {userUpdatedData?.lastName || data.lastName}
                </span>
              )}
            </div>
            <div className="mt-5">
              <Text variant="sectionHeading">Email</Text>
              {isEdited ? (
                <>
                  <Input
                    type="email"
                    {...inputProps('email')}
                    className="!w-[500px] !max-w-[calc(100vw-50px)]"
                  />
                  <div>{errorMessage(errors['email'])}</div>
                </>
              ) : (
                <span>{userUpdatedData?.email || data.email}</span>
              )}
            </div>
            <div className="flex mb-20 md:mb-0 mt-2">
              {isEdited ? (
                <>
                  <Button
                    name="button"
                    aria-label="Update"
                    type="button"
                    onClick={handleSubmit(updateAccount)}
                  >
                    Update
                  </Button>
                  <Button
                    name="button"
                    aria-label="Cancel"
                    type="button"
                    className="ml-10"
                    onClick={() => setIsEdited(false)}
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <Button
                  name="button"
                  aria-label="Edit"
                  type="button"
                  onClick={() => setIsEdited(true)}
                >
                  Edit
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </Container>
  )
}

Profile.Layout = Layout
