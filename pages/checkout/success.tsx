import { Layout } from '@components/common'
import { Text } from '@components/ui'

export default function Success() {
  return (
    <div className="grid lg:grid-cols-12 w-full max-w-7xl mx-auto">
      <div className="lg:col-start-3 lg:col-span-8">
        <div className="flex-1 px-12 py-24 flex flex-col justify-center items-center ">
          <svg
            className="w-36 mb-10 max-w-full"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <Text variant="pageHeading">Order placed successfully</Text>
          <p>A summary of the order will be sent to your email.</p>
        </div>
      </div>
    </div>
  )
}

Success.Layout = Layout
