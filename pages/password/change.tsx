import { Layout } from '@components/common'
import { Button } from '@components/ui'
import Input from '@components/ui/Input'
import { useEffect, useState } from 'react'
import getBrowserSpreeClient from '@framework/utils/spree-clients/get-browser-spree-client'
import { useRouter } from 'next/router'

export default function PasswordChange() {
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [disabled, setDisabled] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  async function handleUpdatePassword(e: React.SyntheticEvent<EventTarget>) {
    e.preventDefault()
    const spreeClient = getBrowserSpreeClient()
    await spreeClient.account.resetPassword({
      reset_password_token: router.query.reset_password_token as string,
      user: { password: password, password_confirmation: passwordConfirmation },
    })
    setMessage('The password has been successfully changed')
  }

  useEffect(() => {
    if (password) {
      if (password.length < 6) {
        setDisabled(true)
        setMessage('Password should be at least 6 characters long')
      } else if (password !== passwordConfirmation) {
        setDisabled(true)
        setMessage('Passowrd confirmation should match the password')
      } else {
        setDisabled(false)
        setMessage('')
      }
    }
  }, [password, passwordConfirmation])

  return (
    <form
      onSubmit={handleUpdatePassword}
      className="m-auto w-80 flex flex-col justify-between p-3"
    >
      <div className="flex flex-col space-y-4">
        {message && <div className="border border-red p-3">{message}</div>}

        <Input placeholder="Password" onChange={setPassword} type="password" />
        <Input
          placeholder="Password Confirmation"
          onChange={setPasswordConfirmation}
          type="password"
        />
        <div className="pt-2 w-full flex flex-col">
          <Button variant="slim" type="submit" disabled={disabled}>
            Update
          </Button>
        </div>
      </div>
    </form>
  )
}

PasswordChange.Layout = Layout
